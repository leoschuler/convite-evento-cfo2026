const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(v: string) {
  return v
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

/** Código visível do convite: CFO-000128 */
export const inviteCode = (guestId: string) => `CFO-${guestId}`;

/** Hash decorativo e estável — usado só como acabamento de "documento". */
export function docHash(seed: string, len = 6) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, len);
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  // Nome de uma palavra só ("iFood") vira duas letras, senão o monograma fica órfão.
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Concordância de gênero. `gendered(g, "convidado", "convidada")` */
export const gendered = (g: "M" | "F" | null | undefined, m: string, f: string) => (g === "F" ? f : m);

/** Artigo da empresa: "da XPTO Alimentos" / "do Grupo Pomin". */
export const companyArticle = (g: "M" | "F" | null | undefined) => (g === "M" ? "do" : "da");

/**
 * Máscara de telefone BR conforme digita: (11) 94234-3927 / (11) 4234-3927.
 * Trunca em 11 dígitos — número maior que isso é erro de digitação.
 */
export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const isValidPhone = (v: string) => {
  const d = onlyDigits(v);
  return d.length === 10 || d.length === 11;
};

export function whatsappLink(phone: string, message: string) {
  const digits = onlyDigits(phone);
  const intl = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
