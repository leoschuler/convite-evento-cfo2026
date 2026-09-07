import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  deleteInvitation,
  nextGuestId,
  normalizeInviteFields,
  readInvitations,
  upsertInvitation,
} from "@/lib/invitations.server";
import { uploadImage, WriteConflictError } from "@/lib/storage.server";
import type { Invitation } from "@/lib/types";

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
    if (e instanceof WriteConflictError) {
      return NextResponse.json({ error: "try_again" }, { status: 503 });
    }
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

  try {
    const removed = await deleteInvitation(slug);
    return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
  } catch (e) {
    if (e instanceof WriteConflictError) {
      return NextResponse.json({ error: "try_again" }, { status: 503 });
    }
    throw e;
  }
}

/** Valida e completa o registro. O cliente nunca define guest_id nem o valor do ingresso. */
async function normalize(b: Record<string, unknown>, originalSlug?: string): Promise<Invitation> {
  const fields = normalizeInviteFields(b);
  const existingId = typeof b.guest_id === "string" ? b.guest_id.trim() : "";
  return { ...fields, guest_id: existingId && originalSlug ? existingId : await nextGuestId() };
}
