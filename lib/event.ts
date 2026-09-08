import type { InviteTier, RelationshipBrand, Speaker, VipBenefit } from "./types";

/**
 * Dados oficiais do CFO Insights — AI Edition 2026.
 * Fonte: https://www.cfoinsights.com.br (conferido em 09/08/2026).
 * Nada aqui é inventado. Ao atualizar, confira contra o site.
 */
export const EVENT = {
  name: "CFO INSIGHTS",
  edition: "AI Edition 2026",
  tagline: "Onde os líderes financeiros do país decidem.",
  /** Reescrito na linguagem de quem responde pelo número, não de quem vende tecnologia. */
  claim: "Em 2026, ter IA não diferencia mais ninguém. Saber onde ela entra no seu P&L, sim.",
  claimSupport:
    "Todo mundo comprou ferramenta. Quase ninguém consegue mostrar o que ela devolveu em margem, em caixa e em risco.",
  promise:
    "Dois dias. Você sai com as decisões que precisa tomar antes do próximo trimestre — e com quem já decidiu.",

  date: "22 e 23 de setembro de 2026",
  dateShort: "22–23 SET 2026",
  venue: "Vibra SP",
  city: "São Paulo",

  host: "Grupo Pomin",
  ceo: "Erick Pomin",
  ceoRole: "CEO, Grupo Pomin",
  ceoPhoto: "/event/speakers/erick-pomin.png",
  ceoPoster: "/event/palco.jpg" as string | null,

  site: "https://www.cfoinsights.com.br",
  logo: "/event/cfo-insights-2026.png",

  idealizers: ["Grupo Pomin", "Solutta", "Auditto", "Alerta Fiscal"],
} as const;

/**
 * Valores iguais para todo convidado. O painel não pergunta nada disso —
 * mudou aqui, mudou em todos os convites novos.
 */
export const INVITE_DEFAULTS = {
  event_date: "22 e 23 de setembro de 2026",
  event_location: "Vibra SP — São Paulo",
  invite_expiration: "15/09/2026",
  concierge_name: "Time CFO Insights",
  concierge_whatsapp: "(11) 94234-3927",
} as const;

export const RELATIONSHIP_LOGOS: Record<RelationshipBrand, string> = {
  Solutta: "/event/logos/relationship/solutta.svg",
  Auditto: "/event/logos/relationship/auditto.png",
  "Grupo Pomin": "/event/logos/relationship/grupo-pomin.png",
};

/** Números do evento. */
export const FACTS = [
  { value: "1.500", label: "participantes" },
  { value: "+700", label: "líderes financeiros" },
  { value: "+20", label: "especialistas" },
  { value: "2", label: "dias de imersão" },
];

/** Trilhas temáticas. Cada linha diz o que o CFO leva embora, não o que será "abordado". */
export const TRACKS = [
  {
    n: "01",
    title: "Reforma Tributária",
    subtitle: "Preparação e execução",
    line: "Como virar a chave de sistema, contrato e preço sem entregar margem no caminho.",
  },
  {
    n: "02",
    title: "CFO Command Center",
    subtitle: "Dados, risco e decisão",
    line: "Parar de fechar o mês olhando para trás e começar a decidir olhando para frente.",
  },
  {
    n: "03",
    title: "Treasury & Payments",
    subtitle: "Caixa e eficiência",
    line: "Onde o caixa trava, onde a fraude entra e o que dá para automatizar já neste trimestre.",
  },
  {
    n: "04",
    title: "Risk & Capital",
    subtitle: "Proteção e alocação",
    line: "Onde alocar capital quando o cenário muda mais rápido que o seu orçamento.",
  },
];

/**
 * Ingressos reais. `benefits` reproduz o que o site informa que cada categoria inclui.
 */
export const TIERS: Record<
  InviteTier,
  { label: string; short: string; value: number; rank: number; benefits: VipBenefit[] , cupom: string}
> = {
  ARQUIBANCADA: {
    label: "Arquibancada Inferior",
    short: "Arquibancada",
    value: 497,
    rank: 1,
    cupom:"CONVITE-X5FWAMWP",
    benefits: [{ title: "Acesso à plenária" }, { title: "Acesso à feira de negócios" }],
  },
  MESA: {
    label: "Mesa",
    short: "Mesa",
    value: 997,
    rank: 2,
    cupom: "CONVITE-KYKNW2AM",
    benefits: [
      { title: "Acesso à plenária" },
      { title: "Acesso à feira de negócios" },
      { title: "Networking exclusivo" },
      { title: "Assento prioritário" },
      { title: "Gravação do evento" },
    ],
  },
  CAMAROTE: {
    label: "Camarote",
    short: "Camarote",
    value: 1897,
    rank: 3,
    cupom: "CONVITE-8J2K9L3N",
    benefits: [
      { title: "Acesso à plenária" },
      { title: "Acesso à feira de negócios" },
      { title: "Entrada VIP" },
      { title: "Workshop / hot seat" },
      { title: "Gravação do evento" },
      { title: "Lunch box" },
    ],
  },
};

/** Palestrantes confirmados. Nome, cargo e empresa exatamente como no site oficial. */
export const SPEAKERS: Speaker[] = [
  {
    name: "Erick Pomin",
    position: "CEO",
    company: "Grupo Pomin",
    photo: "/event/speakers/erick-pomin.png",
    logo: null,
    topic: "O que muda quando finanças deixam de ser área de suporte e passam a ser área de decisão.",
    featured: true,
  },
  {
    name: "João Paulo",
    position: "VP",
    company: "Mercado Livre",
    photo: "/event/speakers/joao-paulo.png",
    logo: "/event/logos/mercadolivre.png",
    topic: "Como uma das maiores operações digitais da América Latina pensa finanças, escala e crescimento.",
    featured: true,
  },
  {
    name: "Ernesto Haberkorn",
    position: "Fundador",
    company: "TOTVS",
    photo: "/event/speakers/Ernesto Haberkorn - TOTVS.jpg",
    logo: null,
    topic: "Tecnologia como infraestrutura de decisão financeira no Brasil.",
    featured: true,
  },
  {
    name: "Leonardo Dias",
    position: "CFO",
    company: "IBM",
    photo: "/event/speakers/Leonardo Dias - IBM.jpg",
    logo: "/event/logos/ibm.png",
    topic: "Finanças em uma operação global sob transformação tecnológica.",
    featured: true,
  },
  {
    name: "Juliana Micali",
    position: "CFO Latam",
    company: "Electrolux",
    photo: "/event/speakers/Juliana Micali - Eletrolux.jpg",
    logo: null,
    topic: "Decisões financeiras em operações de escala global.",
    featured: true,
  },
  {
    name: "Luccas Adib",
    position: "CEO",
    company: "Hapvida",
    photo: "/event/speakers/Lucas Adib - Hapvida 02.jpg",
    logo: "/event/logos/hapvida.png",
    topic: "Capital, risco e crescimento em uma operação de saúde em escala nacional.",
    featured: true,
  },
  {
    name: "Alexandre Malfitani",
    position: "CFO",
    company: "Azul Linhas Aéreas",
    photo: "/event/speakers/Alexandre Malfitani - Azul Linhas Aereas.jpg",
    logo: "/event/logos/azul.png",
    topic: "Estrutura de capital e caixa em um setor de margem apertada.",
    featured: true,
  },
  {
    name: "Gustavo Mendes",
    position: "VP",
    company: "TOTVS",
    photo: "/event/speakers/gustavo-mendes.png",
    logo: null,
    topic: "Dados e automação no centro da rotina financeira.",
  },
  { name: "Leandro Piano", position: "CFO", company: "Belvo", photo: null, topic: null },
  {
    name: "Renato Opice Blum",
    position: "Membro do Conselho",
    company: "Segurança Cibernética Europeia",
    photo: null,
    topic: null,
  },
  { name: "Bruno Cortes", position: "Head Cyber", company: "Nubank", photo: null, topic: null },
  { name: "Pedro Alvarenga", position: "CFO & CSO", company: "Iugu", photo: null, topic: null },
  { name: "Valeria Vilalobo", position: "CFO", company: "Claranet", photo: null, topic: null },
  { name: "Gonzalo Parejo", position: "Fundador e CEO", company: "Kamino", photo: null, topic: null },
  { name: "Cassio Rufino", position: "COO", company: "MZ", photo: null, topic: null },
  { name: "PH Zabisky", position: "CEO", company: "MZ", photo: null, topic: null },
  { name: "Leo Monte", position: "CEO", company: "Finnet", photo: null, topic: null },
  { name: "Rodrigo Ferreira", position: "CEO e Sócio", company: "MakeValue Invest", photo: null, topic: null },
  {
    name: "Mayara Ranni Sekertzis",
    position: "Diretora de Produtos",
    company: "MakeValue Invest",
    photo: null,
    topic: null,
  },
  { name: "Laura Camargo", position: "Cofundadora e CEO", company: "Neofin", photo: null, topic: null },
  { name: "Gustavo Gorenstein", position: "CEO", company: "Jeeves", photo: null, topic: null },
];

/** Palestrantes com destaque editorial na página do convite. */
export const FEATURED_SPEAKERS = SPEAKERS.filter((s) => s.featured);

/** Empresas que estiveram no CFO Insights 2025. É a prova do networking. */
export const NETWORK_COMPANIES = [
  "iFood",
  "Walmart",
  "American Express",
  "TOTVS",
  "Mercado Bitcoin",
  "Iugu",
  "QiTech",
  "Omie",
  "Belvo",
  "Celcoin",
  "Óticas Carol",
  "ContaSimples",
  "Aarin",
  "GPTW",
  "Finscale",
  "Lerian",
  "Vexpenses",
  "Barentz",
  "Roit",
  "MB Associados",
  "ABFintechs",
  "PayTrack",
  "OnFly",
  "ConsultH",
  "Grupo Skill",
  "HIC Capital",
  "IBEF",
];

/** Patrocinadores 2026, por cota. */
export const SPONSORS: { tier: string; names: string[] }[] = [
  { tier: "Diamante", names: ["MZ", "Flash"] },
  { tier: "Ouro", names: ["ECX Corp", "Kamino", "Jeeves", "MakeValue", "Prophix"] },
  { tier: "Prata", names: ["Claranet", "Receiv"] },
  { tier: "Bronze", names: ["MB Labs", "SplitC", "Lerian", "Finnet", "NetSoft"] },
  { tier: "Growth", names: ["Accountfy", "Mogno", "Neofin", "Belluno Pagamentos"] },
];

export const TOPICS = [
  "CAPITAL",
  "AI",
  "M&A",
  "GROWTH",
  "REFORMA TRIBUTÁRIA",
  "EFFICIENCY",
  "DATA",
  "TREASURY",
  "LEADERSHIP",
  "CYBER",
  "CASH",
  "DECISIONS",
  "RISK",
];

export const EXPERIENCE_PILLARS = [
  { k: "01", label: "Conteúdo", line: "Os temas que já estão na mesa dos maiores CFOs do país." },
  { k: "02", label: "Networking", line: "Mais de 700 líderes financeiros na mesma sala." },
  { k: "03", label: "Perspectiva", line: "Como operações de escala decidem sob incerteza." },
  { k: "04", label: "Decisões", line: "Menos teoria. Mais o que foi feito e o que aconteceu depois." },
  { k: "05", label: "Execução", line: "Um plano para os próximos 90 dias, não um caderno de anotações." },
  { k: "06", label: "Acesso", line: "Uma sala que normalmente não está aberta." },
];
