import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { BatchValidationError, createInvitationsBatch } from "@/lib/invitations.server";
import { WriteConflictError } from "@/lib/storage.server";

/**
 * Import em lote: o admin cola um array JSON de convites (sem guest_id, que
 * é sempre gerado aqui) e todos entram numa única escrita — tudo ou nada.
 */
export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const created = await createInvitationsBatch(body);
    return NextResponse.json({ ok: true, created });
  } catch (e) {
    if (e instanceof BatchValidationError) {
      return NextResponse.json({ error: e.message, index: e.index }, { status: 400 });
    }
    if (e instanceof WriteConflictError) {
      return NextResponse.json({ error: "try_again" }, { status: 503 });
    }
    const code = e instanceof Error ? e.message : "invalid_payload";
    return NextResponse.json({ error: code }, { status: 400 });
  }
}
