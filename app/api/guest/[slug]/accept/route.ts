import { NextResponse } from "next/server";
import { getInvitation, upsertInvitation } from "@/lib/invitations.server";
import { WriteConflictError } from "@/lib/storage.server";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invitation.invite_status === "EXPIRED" || invitation.invite_status === "CANCELLED") {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  if (!isValid(body)) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  try {
    const updated = await upsertInvitation({ ...invitation, ...body, invite_status: "ACCEPTED" }, slug);
    return NextResponse.json({ ok: true, invite_slug: slug, invite_status: updated.invite_status });
  } catch (e) {
    if (e instanceof WriteConflictError) {
      return NextResponse.json({ error: "try_again" }, { status: 503 });
    }
    throw e;
  }
}

function isValid(b: unknown): boolean {
  if (!b || typeof b !== "object") return false;
  const v = b as Record<string, unknown>;
  const str = (k: string) => typeof v[k] === "string" && (v[k] as string).trim().length > 0;
  return (
    str("guest_name") &&
    str("company_name") &&
    typeof v.guest_email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.guest_email) &&
    typeof v.guest_whatsapp === "string" &&
    v.guest_whatsapp.replace(/\D/g, "").length >= 10
  );
}
