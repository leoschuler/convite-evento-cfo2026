/**
 * Cadastra um convite novo em data/invitations.json.
 *
 *   npm run invite -- --name "João Silva" --company "XPTO Alimentos" --tier MESA
 *
 * Opcionais:
 *   --position "CFO"          cargo do convidado
 *   --gender   M|F            como nos referimos ao convidado (padrão M)
 *   --companyGender M|F       artigo da empresa: "do" | "da" (padrão F)
 *   --whatsapp "(11) 9..."    para onde o concierge envia o link
 *   --email    "a@b.com"      e-mail do convidado
 *   --photo    "/event/..."   retrato do convidado (aparece na abertura)
 *   --logo     "/event/..."   logo da empresa (aparece no rodapé da abertura)
 *   --brand    "Solutta"      Solutta | Auditto | Grupo Pomin
 *   --since    "2021"         cliente desde
 *   --ae       "Maria"        executivo de conta
 *   --reason   "..."          texto pessoal do Erick (1a pessoa). Sem isso, usa o fallback elegante.
 *   --expires  "15/09/2026"   reserva até
 *   --slug     "custom-slug"  força o slug
 *   --status   AVAILABLE      AVAILABLE | ACCEPTED | EXPIRED | CANCELLED
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "invitations.json");

const TIERS = { ARQUIBANCADA: 497, MESA: 997, CAMAROTE: 1897 };
const EVENT_DATE = "22 e 23 de setembro de 2026";
const EVENT_LOCATION = "Vibra SP — São Paulo";
const CONCIERGE = { name: "Time CFO Insights", whatsapp: "(11) 94234-3927" };

function args() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    out[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") ? true : argv[++i];
  }
  return out;
}

const slugify = (v) =>
  v
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function die(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

const a = args();
if (!a.name) die('Falta --name. Ex.: npm run invite -- --name "João Silva" --company "XPTO" --tier MESA');
if (!a.company) die("Falta --company.");

const tier = String(a.tier || "MESA").toUpperCase();
if (!TIERS[tier]) die(`--tier inválido: ${tier}. Use ARQUIBANCADA, MESA ou CAMAROTE.`);

const status = String(a.status || "AVAILABLE").toUpperCase();
if (!["AVAILABLE", "ACCEPTED", "EXPIRED", "CANCELLED"].includes(status)) die(`--status inválido: ${status}`);

const list = JSON.parse(readFileSync(FILE, "utf8"));

const firstName = String(a.name).trim().split(/\s+/)[0];
const baseSlug = a.slug ? slugify(a.slug) : `${slugify(a.name)}-${slugify(String(a.company).split(/\s+/)[0])}`;

let slug = baseSlug;
for (let n = 2; list.some((i) => i.invite_slug === slug); n++) slug = `${baseSlug}-${n}`;

const nextId = String(Math.max(0, ...list.map((i) => Number(i.guest_id) || 0)) + 1).padStart(6, "0");

const invite = {
  invite_slug: slug,
  guest_id: nextId,
  guest_name: String(a.name).trim(),
  guest_first_name: firstName,
  guest_position: a.position ? String(a.position) : null,
  guest_gender: String(a.gender || "M").toUpperCase() === "F" ? "F" : "M",
  guest_photo: a.photo ? String(a.photo) : null,
  guest_whatsapp: a.whatsapp ? String(a.whatsapp) : null,
  guest_email: a.email ? String(a.email) : null,
  company_name: String(a.company).trim(),
  company_gender: String(a.companyGender || "F").toUpperCase() === "M" ? "M" : "F",
  company_logo: a.logo ? String(a.logo) : null,
  relationship_brand: a.brand ? String(a.brand) : null,
  relationship_since: a.since ? String(a.since) : null,
  account_executive_name: a.ae ? String(a.ae) : null,
  invitation_reason: a.reason ? String(a.reason) : null,
  invite_tier: tier,
  invite_commercial_value: TIERS[tier],
  invite_expiration: a.expires ? String(a.expires) : null,
  invite_status: status,
  event_date: EVENT_DATE,
  event_location: EVENT_LOCATION,
  concierge_name: CONCIERGE.name,
  concierge_whatsapp: CONCIERGE.whatsapp,
  erick_video_url: null,
  erick_photo: null,
};

list.push(invite);
writeFileSync(FILE, `${JSON.stringify(list, null, 2)}\n`, "utf8");

console.log(`
  ✓ Convite criado

    Convidado   ${invite.guest_name}${invite.guest_position ? ` — ${invite.guest_position}` : ""}
    Empresa     ${invite.company_name}
    Categoria   ${tier} (R$ ${TIERS[tier].toLocaleString("pt-BR")})
    Guest ID    CFO-${nextId}

    Link        /guest/${slug}
`);
