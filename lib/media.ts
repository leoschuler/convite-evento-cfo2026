/**
 * Registro de imagens da experiência.
 *
 * /event → fotografia real do CFO Insights 2025 e retratos oficiais 2026.
 * /mock  → placas abstratas geradas por `node scripts/gen-mock-plates.mjs`, usadas só pela v2.
 *
 * Para trocar qualquer imagem, altere o `src` aqui. Nenhum componente muda.
 */
export type Plate = { src: string; alt: string };

/** Fotografia real do evento. Base visual da v3. */
export const PHOTOS = {
  plenaria: { src: "/event/plenaria.jpg", alt: "Plenária do CFO Insights 2025 durante uma sessão" },
  networking: { src: "/event/networking.jpg", alt: "Feira de negócios do CFO Insights 2025" },
  palco: { src: "/event/palco.jpg", alt: "Palco do CFO Insights 2025" },
  estande: { src: "/event/estande.jpg", alt: "Estande Auditto e Alerta Fiscal no CFO Insights 2025" },
  conversas: { src: "/event/conversas.jpg", alt: "Conversas na feira de negócios do CFO Insights 2025" },
  lounge: { src: "/event/lounge.jpg", alt: "Lounge do CFO Insights 2025" },
} as const satisfies Record<string, Plate>;

/** Galeria — "o que acontece lá dentro". `tall` alterna o ritmo da faixa. */
export const EVENT_GALLERY: (Plate & { kicker: string; caption: string; tall?: boolean })[] = [
  { ...PHOTOS.plenaria, kicker: "01", caption: "1.500 pessoas na plenária" },
  { ...PHOTOS.conversas, kicker: "02", caption: "As conversas que fecham negócio", tall: true },
  { ...PHOTOS.networking, kicker: "03", caption: "A feira, onde tudo acontece" },
  { ...PHOTOS.estande, kicker: "04", caption: "Auditto e Alerta Fiscal", tall: true },
  { ...PHOTOS.palco, kicker: "05", caption: "O palco principal" },
  { ...PHOTOS.lounge, kicker: "06", caption: "Os intervalos" },
];

/* ---------- v2 (placas mockadas) — mantidas só para a rota /v2 ---------- */

export const PLATES = {
  hero: { src: "/mock/hero-hall.svg", alt: "Plenária do CFO Insights durante uma sessão" },
  invitation: { src: "/mock/detail-credential.svg", alt: "Detalhe da credencial do evento" },
  roomStage: { src: "/mock/room-audience.svg", alt: "Auditório em contraluz durante a abertura" },
  roomTable: { src: "/mock/room-table.svg", alt: "Sessão fechada em mesa executiva" },
  roomPeople: { src: "/mock/networking-wide.svg", alt: "Executivos reunidos entre as sessões" },
  conversations: { src: "/mock/networking-tall.svg", alt: "Conversa entre dois convidados" },
  venue: { src: "/mock/venue-wide.svg", alt: "Arquitetura do espaço do evento" },
  venueTall: { src: "/mock/venue-tall.svg", alt: "Detalhe arquitetônico do espaço" },
  access: { src: "/mock/detail-stage.svg", alt: "Detalhe do palco antes da abertura" },
  erick: { src: "/mock/erick-poster.svg", alt: "Erick Pomin, CEO do Grupo Pomin" },
} as const satisfies Record<string, Plate>;

export const GALLERY: (Plate & { kicker: string; caption: string; tall?: boolean })[] = [
  { ...PLATES.roomStage, kicker: "01", caption: "A abertura" },
  { ...PLATES.conversations, kicker: "02", caption: "As conversas paralelas", tall: true },
  { ...PLATES.roomPeople, kicker: "03", caption: "Os intervalos, onde tudo acontece" },
  { ...PLATES.venueTall, kicker: "04", caption: "A casa", tall: true },
  { ...PLATES.roomTable, kicker: "05", caption: "As sessões fechadas" },
  { ...PLATES.access, kicker: "06", caption: "Minutos antes da abertura" },
];

export const SPEAKER_PLATES = [
  "/mock/speaker-01.svg",
  "/mock/speaker-02.svg",
  "/mock/speaker-03.svg",
  "/mock/speaker-04.svg",
];

export const speakerPlate = (index: number) => SPEAKER_PLATES[index % SPEAKER_PLATES.length];
