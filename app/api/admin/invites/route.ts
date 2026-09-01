import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  deleteInvitation,
  nextGuestId,
  readInvitations,
  upsertInvitation,
} from "@/lib/invitations.server";
import { uploadImage } from "@/lib/storage.server";
import { INVITE_DEFAULTS, TIERS } from "@/lib/event";
import { slugify } from "@/lib/format";
import type { Invitation, InviteStatus, InviteTier } from "@/lib/types";

const TIER_KEYS = Object.keys(TIERS) as InviteTier[];
const STATUSES: InviteStatus[] = ["AVAILABLE", "ACCEPTED", "EXPIRED", "CANCELLED"];
const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAuthenticated())) return deny();
  return NextResponse.json({ invites: await readInvitations() });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return deny();

  const form = await req.formData().catch(() => null);
  const raw = form?.get("invite");
  let body: Record<string, unknown> | null = null;
  try {
    body = typeof raw === "string" ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {}
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const originalSlug = typeof body.originalSlug === "string" ? body.originalSlug : undefined;

  try {
    const guestPhoto = form?.get("guest_photo");
    const companyLogo = form?.get("company_logo");
    const invite = await normalize(body, originalSlug);
    if (guestPhoto && typeof guestPhoto !== "string") invite.guest_photo = await saveImage(guestPhoto);
    if (companyLogo && typeof companyLogo !== "string") invite.company_logo = await saveImage(companyLogo);
    await upsertInvitation(invite, originalSlug);
    return NextResponse.json({ ok: true, invite });
  } catch (e) {
    const code = e instanceof Error ? e.message : "invalid_payload";
    return NextResponse.json({ error: code }, { status: code === "slug_taken" ? 409 : 400 });
  }
}

async function saveImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  if (!ext || !file.size || file.size > MAX_IMAGE_SIZE) throw new Error("invalid_image");

  const bytes = Buffer.from(await file.arrayBuffer());
  const valid =
    (ext === "jpg" && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
    (ext === "png" && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (ext === "webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP");
  if (!valid) throw new Error("invalid_image");

  return uploadImage(bytes, ext, file.type);
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return deny();

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const removed = await deleteInvitation(slug);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}

/** Valida e completa o registro. O cliente nunca define guest_id nem o valor do ingresso. */
async function normalize(b: Record<string, unknown>, originalSlug?: string): Promise<Invitation> {
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const nullable = (k: string) => {
    const v = str(k);
    return v.length ? v : null;
  };

  const guest_name = str("guest_name");
  const company_name = str("company_name");
  if (!guest_name) throw new Error("guest_name_required");
  if (!company_name) throw new Error("company_name_required");

  const tier = (str("invite_tier").toUpperCase() as InviteTier) || "MESA";
  if (!TIER_KEYS.includes(tier)) throw new Error("invalid_tier");

  const status = (str("invite_status").toUpperCase() as InviteStatus) || "AVAILABLE";
  if (!STATUSES.includes(status)) throw new Error("invalid_status");

  const slug = slugify(str("invite_slug") || `${guest_name}-${company_name.split(/\s+/)[0]}`);
  if (!slug) throw new Error("invalid_slug");

  const existingId = str("guest_id");

  return {
    invite_slug: slug,
    guest_id: existingId && originalSlug ? existingId : await nextGuestId(),
    guest_name,
    guest_first_name: str("guest_first_name") || guest_name.split(/\s+/)[0],
    guest_position: nullable("guest_position"),
    guest_gender: str("guest_gender").toUpperCase() === "F" ? "F" : "M",
    guest_photo: nullable("guest_photo"),
    guest_whatsapp: nullable("guest_whatsapp"),
    guest_email: nullable("guest_email"),
    company_name,
    company_gender: str("company_gender").toUpperCase() === "M" ? "M" : "F",
    company_logo: nullable("company_logo"),
    relationship_brand: (nullable("relationship_brand") as Invitation["relationship_brand"]) ?? null,
    relationship_since: nullable("relationship_since"),
    account_executive_name: nullable("account_executive_name"),
    invitation_reason: nullable("invitation_reason"),
    invite_tier: tier,
    invite_commercial_value: TIERS[tier].value,
    invite_expiration: nullable("invite_expiration"),
    invite_status: status,
    event_date: str("event_date") || INVITE_DEFAULTS.event_date,
    event_location: str("event_location") || INVITE_DEFAULTS.event_location,
    concierge_name: nullable("concierge_name") ?? INVITE_DEFAULTS.concierge_name,
    concierge_whatsapp: nullable("concierge_whatsapp") ?? INVITE_DEFAULTS.concierge_whatsapp,
    erick_video_url: nullable("erick_video_url"),
    erick_photo: nullable("erick_photo"),
  };
}
