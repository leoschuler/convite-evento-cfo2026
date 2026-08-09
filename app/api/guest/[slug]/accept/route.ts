import { NextResponse } from "next/server";
import { getInvitation } from "@/lib/invitations.server";

/**
 * Stub do aceite. Valida o convite e devolve ok.
 * ponytail: sem persistência — plugar o gravador (DB/CRM) exatamente aqui.
 */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invitation.invite_status === "EXPIRED" || invitation.invite_status === "CANCELLED") {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  if (!isValid(body)) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  return NextResponse.json({ ok: true, invite_slug: slug, invite_status: "ACCEPTED" });
}

function isValid(b: unknown): boolean {
  if (!b || typeof b !== "object") return false;
  const v = b as Record<string, unknown>;
  const str = (k: string) => typeof v[k] === "string" && (v[k] as string).trim().length > 0;
  return (
    str("guest_name") &&
    str("company_name") &&
    typeof v.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) &&
    typeof v.whatsapp === "string" &&
    v.whatsapp.replace(/\D/g, "").length >= 10
  );
}
