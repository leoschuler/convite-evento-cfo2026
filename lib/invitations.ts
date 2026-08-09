import type { AcceptPayload } from "./types";

/**
 * Lado cliente. A leitura dos convites vive em lib/invitations.server.ts —
 * este arquivo é importado por componentes de cliente e não pode tocar em fs.
 */
export async function acceptInvitation(slug: string, payload: AcceptPayload): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/guest/${encodeURIComponent(slug)}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("accept_failed");
  return res.json();
}
