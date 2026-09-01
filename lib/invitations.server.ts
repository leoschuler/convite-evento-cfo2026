import "server-only";
import seed from "@/data/invitations.json";
import { readInvitationsFromBucket, writeInvitationsToBucket } from "./storage.server";
import type { Invitation } from "./types";

/**
 * Fonte dos convites: data/invitations.json dentro do bucket R2, lido a cada
 * requisição para que o painel admin publique um convite novo sem rebuild.
 * O JSON versionado em data/invitations.json vira só o seed inicial — serve
 * de fallback até a primeira escrita popular o objeto no bucket (filesystem
 * local não é confiável em produção/serverless).
 *
 * Para trocar por banco/CRM, só este arquivo muda.
 */
export async function readInvitations(): Promise<Invitation[]> {
  const raw = await readInvitationsFromBucket();
  if (raw) {
    try {
      return JSON.parse(raw) as Invitation[];
    } catch {}
  }
  return seed as unknown as Invitation[];
}

export async function writeInvitations(list: Invitation[]): Promise<void> {
  await writeInvitationsToBucket(`${JSON.stringify(list, null, 2)}\n`);
}

export async function getInvitation(slug: string): Promise<Invitation | null> {
  const list = await readInvitations();
  return list.find((i) => i.invite_slug === slug) ?? null;
}

export async function listInvitationSlugs(): Promise<string[]> {
  return (await readInvitations()).map((i) => i.invite_slug);
}

/** Cria ou atualiza. `originalSlug` permite renomear o slug sem perder o registro. */
export async function upsertInvitation(invite: Invitation, originalSlug?: string): Promise<Invitation> {
  const list = await readInvitations();
  const key = originalSlug ?? invite.invite_slug;
  const at = list.findIndex((i) => i.invite_slug === key);

  const clash = list.findIndex((i) => i.invite_slug === invite.invite_slug);
  if (clash !== -1 && clash !== at) throw new Error("slug_taken");

  if (at === -1) list.push(invite);
  else list[at] = invite;

  await writeInvitations(list);
  return invite;
}

export async function deleteInvitation(slug: string): Promise<boolean> {
  const list = await readInvitations();
  const next = list.filter((i) => i.invite_slug !== slug);
  if (next.length === list.length) return false;
  await writeInvitations(next);
  return true;
}

/** Próximo guest_id sequencial, com 6 dígitos. */
export async function nextGuestId(): Promise<string> {
  const list = await readInvitations();
  const max = Math.max(0, ...list.map((i) => Number(i.guest_id) || 0));
  return String(max + 1).padStart(6, "0");
}
