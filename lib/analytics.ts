import { slugify } from "./format";
import type { Invitation } from "./types";

export type InviteEvent =
  | "invite_page_view"
  | "invite_gate_opened"
  | "invite_experience_started"
  | "invite_scroll_25"
  | "invite_scroll_50"
  | "invite_scroll_75"
  | "invite_scroll_100"
  | "erick_video_started"
  | "erick_video_completed"
  | "speaker_interaction"
  | "invite_accept_clicked"
  | "invite_accepted"
  | "concierge_clicked";

type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Contexto não-pessoal enviado em todo evento. Sem nome, e-mail ou telefone. */
export function inviteContext(i: Invitation): Params {
  return {
    guest_id: i.guest_id,
    invite_tier: i.invite_tier,
    relationship_brand: i.relationship_brand ?? "unknown",
    company_id: slugify(i.company_name),
  };
}

export function track(event: InviteEvent, context: Params, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...context, ...params });
}
