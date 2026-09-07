import "server-only";
import seed from "@/data/invitations.json";
import { INVITE_DEFAULTS, TIERS } from "./event";
import { slugify } from "./format";
import { readInvitationsFromBucket, writeInvitationsToBucket, WriteConflictError } from "./storage.server";
import type { Invitation, InviteStatus, InviteTier } from "./types";

const TIER_KEYS = Object.keys(TIERS) as InviteTier[];
const STATUSES: InviteStatus[] = ["AVAILABLE", "ACCEPTED", "EXPIRED", "CANCELLED"];

/** Erro de validação de um item específico dentro de um lote (índice + motivo). */
export class BatchValidationError extends Error {
  index: number;
  constructor(index: number, message: string) {
    super(message);
    this.name = "BatchValidationError";
    this.index = index;
  }
}

/**
 * Valida e completa os campos de um convite a partir de um objeto solto (ex:
 * JSON colado no admin) — tudo de Invitation exceto guest_id, que é sempre
 * atribuído pelo servidor. Compartilhado entre a criação individual e o
 * import em lote para as duas regras de negócio não divergirem.
 */
export function normalizeInviteFields(b: Record<string, unknown>): Omit<Invitation, "guest_id"> {
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

  return {
    invite_slug: slug,
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

/**
 * Fonte dos convites: data/invitations.json dentro do bucket R2, lido a cada
 * requisição para que o painel admin publique um convite novo sem rebuild.
 * O JSON versionado em data/invitations.json vira só o seed inicial — serve
 * de fallback até a primeira escrita popular o objeto no bucket (filesystem
 * local não é confiável em produção/serverless).
 *
 * Para trocar por banco/CRM, só este arquivo muda.
 */
async function readInvitationsWithEtag(): Promise<{ list: Invitation[]; etag: string | null }> {
  const raw = await readInvitationsFromBucket();
  if (raw) {
    try {
      return { list: JSON.parse(raw.body) as Invitation[], etag: raw.etag };
    } catch {}
  }
  return { list: seed as unknown as Invitation[], etag: null };
}

export async function readInvitations(): Promise<Invitation[]> {
  return (await readInvitationsWithEtag()).list;
}

// Serializa as escritas dentro deste processo: sem isso, dois requests
// concorrentes (ex: dois convidados aceitando ao mesmo tempo) podem ler a
// mesma versão do arquivo e a segunda escrita apaga a primeira. Isolado não
// basta com múltiplas instâncias do servidor — daí o ETag em mutateInvitations.
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const MAX_ATTEMPTS = 5;

/**
 * Lê a lista, aplica `mutate` e escreve de volta com escrita condicional
 * (If-Match no ETag lido). Se outra escrita venceu a corrida entre a leitura
 * e a escrita — outra instância do servidor, por exemplo — o R2 recusa com
 * 412 e a gente relê a versão atual e tenta de novo, reaplicando `mutate`
 * sobre os dados mais recentes em vez de perder a mudança concorrente.
 *
 * `mutate` deve devolver a MESMA referência da lista recebida quando não há
 * nada a fazer (ex: apagar um slug que não existe) — nesse caso a escrita é
 * pulada.
 */
async function mutateInvitations(mutate: (list: Invitation[]) => Invitation[]): Promise<Invitation[]> {
  return serialize(async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { list, etag } = await readInvitationsWithEtag();
      const next = mutate(list);
      if (next === list) return next;

      try {
        await writeInvitationsToBucket(`${JSON.stringify(next, null, 2)}\n`, etag);
        return next;
      } catch (e) {
        if (e instanceof WriteConflictError && attempt < MAX_ATTEMPTS - 1) continue;
        throw e;
      }
    }
    throw new WriteConflictError();
  });
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
  const key = originalSlug ?? invite.invite_slug;

  await mutateInvitations((list) => {
    const at = list.findIndex((i) => i.invite_slug === key);

    const clash = list.findIndex((i) => i.invite_slug === invite.invite_slug);
    if (clash !== -1 && clash !== at) throw new Error("slug_taken");

    const next = list.slice();
    if (at === -1) next.push(invite);
    else next[at] = invite;
    return next;
  });

  return invite;
}

export async function deleteInvitation(slug: string): Promise<boolean> {
  let removed = false;

  await mutateInvitations((list) => {
    const next = list.filter((i) => i.invite_slug !== slug);
    if (next.length === list.length) return list;
    removed = true;
    return next;
  });

  return removed;
}

/** Próximo guest_id sequencial, com 6 dígitos. */
export async function nextGuestId(): Promise<string> {
  const list = await readInvitations();
  const max = Math.max(0, ...list.map((i) => Number(i.guest_id) || 0));
  return String(max + 1).padStart(6, "0");
}

const MAX_BATCH_SIZE = 1000;

/**
 * Cria vários convites de uma vez (import em lote, colado como JSON no
 * admin). Tudo ou nada: se qualquer item falhar a validação, nada é
 * escrito. guest_id é sempre sequencial, atribuído aqui — nunca aceito do
 * item de entrada. A checagem de slug duplicado (contra o lote e contra os
 * convites existentes) e a atribuição de guest_id rodam dentro da mesma
 * transação de mutateInvitations, contra a lista mais recente, para não
 * colidir com outra escrita concorrente.
 */
export async function createInvitationsBatch(rawItems: unknown[]): Promise<Invitation[]> {
  if (!rawItems.length) throw new Error("empty_batch");
  if (rawItems.length > MAX_BATCH_SIZE) throw new Error("batch_too_large");

  const fields = rawItems.map((item, i) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new BatchValidationError(i, "invalid_item");
    }
    try {
      return normalizeInviteFields(item as Record<string, unknown>);
    } catch (e) {
      throw new BatchValidationError(i, e instanceof Error ? e.message : "invalid_item");
    }
  });

  const seenInBatch = new Map<string, number>();
  fields.forEach((f, i) => {
    if (seenInBatch.has(f.invite_slug)) throw new BatchValidationError(i, "slug_duplicated_in_batch");
    seenInBatch.set(f.invite_slug, i);
  });

  let created: Invitation[] = [];

  await mutateInvitations((list) => {
    const existingSlugs = new Set(list.map((i) => i.invite_slug));
    fields.forEach((f, i) => {
      if (existingSlugs.has(f.invite_slug)) throw new BatchValidationError(i, "slug_taken");
    });

    let nextId = Math.max(0, ...list.map((i) => Number(i.guest_id) || 0));
    created = fields.map((f) => {
      nextId += 1;
      return { ...f, guest_id: String(nextId).padStart(6, "0") };
    });

    return [...list, ...created];
  });

  return created;
}
