/** Categorias reais de ingresso do CFO Insights 2026. */
export type InviteTier = "ARQUIBANCADA" | "MESA" | "CAMAROTE";

export type InviteStatus = "AVAILABLE" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type RelationshipBrand = "Solutta" | "Auditto" | "Grupo Pomin";

/** Como nos referimos ao convidado e à empresa. Define artigos e concordância. */
export type Gender = "M" | "F";

/**
 * Contrato do convite. Tudo que a página consome passa por aqui.
 * Campos novos entram como opcionais para não quebrar registros existentes.
 */
export interface Invitation {
  invite_slug: string;

  guest_id: string;
  guest_name: string;
  guest_first_name: string;
  guest_position: string | null;
  /** Concordância: "convidado" / "convidada", "bem-vindo" / "bem-vinda". */
  guest_gender: Gender;
  /** Retrato do convidado. Aparece ao lado do retrato do Erick na abertura. */
  guest_photo: string | null;
  /** Para onde o concierge envia o link. Só uso interno. */
  guest_whatsapp: string | null;
  guest_email: string | null;

  company_name: string;
  /** Artigo da empresa: "da Solutta" / "do Grupo Pomin". */
  company_gender: Gender;
  company_logo: string | null;

  relationship_brand: RelationshipBrand | null;
  relationship_since: string | null;

  account_executive_name: string | null;

  invitation_reason: string | null;

  invite_tier: InviteTier;
  invite_commercial_value: number;

  invite_expiration: string | null;
  invite_status: InviteStatus;

  event_date: string;
  event_location: string;

  concierge_name: string | null;
  concierge_whatsapp: string | null;

  /** Vídeo do Erick. Genérico para todos os convidados. */
  erick_video_url?: string | null;
  /** Sobrescreve a foto padrão do Erick neste convite. */
  erick_photo?: string | null;

  /** Sobrescreve os benefícios padrão do tier. Vazio = usa os do catálogo. */
  vip_benefits?: VipBenefit[];
}

export interface VipBenefit {
  title: string;
  description?: string | null;
}

export interface Speaker {
  /** Vazio/null quando o nome ainda não foi divulgado. */
  name: string | null;
  position: string | null;
  company: string;
  photo: string | null;
  /** Logo da empresa, quando disponível. */
  logo?: string | null;
  /** Frase conceitual da experiência — nunca uma fala atribuída ao executivo. */
  topic: string | null;
  featured?: boolean;
}

/** Dados enviados no aceite. */
export interface AcceptPayload {
  guest_name: string;
  guest_position: string;
  company_name: string;
  email: string;
  whatsapp: string;
}
