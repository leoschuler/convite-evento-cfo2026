/**
 * Gera as placas mockadas em public/mock/.
 *
 * São imagens cinematográficas abstratas — luz, profundidade e silhuetas — feitas
 * para ocupar exatamente o lugar da fotografia final. Para substituir, troque o
 * arquivo e aponte o novo caminho em lib/media.ts.
 *
 * node scripts/gen-mock-plates.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mock");

/* PRNG com semente: mesma placa em toda execucao. */
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const COLD = "#8fa2c4";
const WARM = "#c9ae82";
const PALE = "#e8ecf4";

const light = (id, color, stop = 0.55) => `
  <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${color}" stop-opacity="${stop}"/>
    <stop offset="55%" stop-color="${color}" stop-opacity="${stop * 0.28}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </radialGradient>`;

const blob = (id, cx, cy, rx, ry, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" transform="rotate(${rot} ${cx} ${cy})"/>`;

/** Silhuetas de plateia: ombros + cabeca, desfocadas. */
function crowd(w, h, count, baseY, scale, seed, opacity = 0.92) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = (w / count) * i + r() * (w / count) * 0.6;
    const s = scale * (0.78 + r() * 0.5);
    const y = baseY + (r() - 0.5) * h * 0.03;
    out += `
      <g opacity="${(opacity * (0.55 + r() * 0.45)).toFixed(2)}">
        <circle cx="${x.toFixed(0)}" cy="${(y - s * 1.15).toFixed(0)}" r="${(s * 0.42).toFixed(0)}"/>
        <path d="M${(x - s * 0.95).toFixed(0)} ${(y + s * 2.4).toFixed(0)}
                 q0 -${(s * 1.6).toFixed(0)} ${(s * 0.95).toFixed(0)} -${(s * 1.6).toFixed(0)}
                 q${(s * 0.95).toFixed(0)} 0 ${(s * 0.95).toFixed(0)} ${(s * 1.6).toFixed(0)} z"/>
      </g>`;
  }
  return `<g fill="#05060a" filter="url(#soft)">${out}</g>`;
}

/** Bokeh: pontos de luz desfocados, o traco mais fotografico que existe. */
function bokeh(w, h, count, seed) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = r() * w;
    const cy = h * (0.12 + r() * 0.55);
    const rad = 6 + r() * 26;
    out += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="url(#bok)" opacity="${(
      0.12 +
      r() * 0.4
    ).toFixed(2)}"/>`;
  }
  return `<g>${out}</g>`;
}

function frame({ w, h, body, defs = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c0e13"/>
      <stop offset="55%" stop-color="#080a0e"/>
      <stop offset="100%" stop-color="#040507"/>
    </linearGradient>
    <radialGradient id="bok" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${PALE}" stop-opacity="0.9"/>
      <stop offset="62%" stop-color="${PALE}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${PALE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="45%" r="72%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${(w / 260).toFixed(1)}"/>
    </filter>
    <filter id="softer" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${(w / 90).toFixed(1)}"/>
    </filter>
    ${defs}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#base)"/>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>
`;
}

/* ---------------- receitas de cena ---------------- */

const scenes = {
  /** Plenaria: feixe de luz sobre o palco, plateia em contraluz. */
  stage: ({ w, h, seed }) =>
    frame({
      w,
      h,
      defs: light("l1", PALE, 0.5) + light("l2", COLD, 0.34) + light("l3", WARM, 0.2),
      body: `
        <g filter="url(#softer)">
          <path d="M${w * 0.5} ${-h * 0.05} L${w * 0.86} ${h * 0.72} L${w * 0.14} ${h * 0.72} Z" fill="url(#l1)" opacity="0.5"/>
        </g>
        ${blob("l2", w * 0.5, h * 0.3, w * 0.4, h * 0.3)}
        ${blob("l3", w * 0.86, h * 0.6, w * 0.26, h * 0.3)}
        <rect x="0" y="${h * 0.63}" width="${w}" height="${h * 0.012}" fill="${PALE}" opacity="0.09"/>
        ${bokeh(w, h, 16, seed + 3)}
        ${crowd(w, h, 22, h * 0.98, w * 0.028, seed)}
        ${crowd(w, h, 14, h * 1.12, w * 0.042, seed + 1)}`,
    }),

  /** Sala fechada: luz lateral quente, mesa, pessoas sentadas. */
  room: ({ w, h, seed }) =>
    frame({
      w,
      h,
      defs: light("l1", WARM, 0.42) + light("l2", COLD, 0.3),
      body: `
        ${blob("l1", w * 0.16, h * 0.34, w * 0.34, h * 0.44)}
        ${blob("l2", w * 0.88, h * 0.2, w * 0.3, h * 0.34)}
        <rect x="0" y="${h * 0.74}" width="${w}" height="${h * 0.008}" fill="${WARM}" opacity="0.16"/>
        <rect x="${w * 0.08}" y="${h * 0.76}" width="${w * 0.84}" height="${h * 0.3}" fill="#07080b" opacity="0.9" filter="url(#soft)"/>
        ${bokeh(w, h, 10, seed + 5)}
        ${crowd(w, h, 9, h * 0.8, w * 0.05, seed)}`,
    }),

  /** Networking: figuras de pe, profundidade curta. */
  networking: ({ w, h, seed }) =>
    frame({
      w,
      h,
      defs: light("l1", COLD, 0.38) + light("l2", PALE, 0.3) + light("l3", WARM, 0.22),
      body: `
        ${blob("l1", w * 0.32, h * 0.26, w * 0.36, h * 0.4)}
        ${blob("l2", w * 0.72, h * 0.36, w * 0.24, h * 0.3)}
        ${blob("l3", w * 0.08, h * 0.82, w * 0.28, h * 0.3)}
        ${bokeh(w, h, 22, seed + 7)}
        ${crowd(w, h, 5, h * 1.02, w * 0.075, seed)}
        ${crowd(w, h, 8, h * 0.86, w * 0.04, seed + 2, 0.6)}`,
    }),

  /** Arquitetura: verticais, luz fria, sem pessoas. */
  venue: ({ w, h, seed }) => {
    const r = rng(seed);
    let cols = "";
    for (let i = 0; i < 9; i++) {
      const x = (w / 9) * i + w * 0.02;
      cols += `<rect x="${x.toFixed(0)}" y="${(-h * 0.05).toFixed(0)}" width="${(w * 0.012).toFixed(
        0,
      )}" height="${(h * 1.1).toFixed(0)}" fill="${PALE}" opacity="${(0.03 + r() * 0.07).toFixed(3)}"/>`;
    }
    return frame({
      w,
      h,
      defs: light("l1", COLD, 0.34) + light("l2", PALE, 0.26),
      body: `
        ${blob("l1", w * 0.5, h * 0.12, w * 0.6, h * 0.3)}
        ${cols}
        ${blob("l2", w * 0.5, h * 0.95, w * 0.5, h * 0.22)}
        <rect x="0" y="${h * 0.86}" width="${w}" height="${h * 0.006}" fill="${PALE}" opacity="0.12"/>`,
    });
  },

  /** Detalhe: profundidade rasa, uma faixa de luz. */
  detail: ({ w, h, seed }) =>
    frame({
      w,
      h,
      defs: light("l1", PALE, 0.4) + light("l2", WARM, 0.26),
      body: `
        ${blob("l1", w * 0.62, h * 0.42, w * 0.42, h * 0.2, -18)}
        ${blob("l2", w * 0.2, h * 0.72, w * 0.3, h * 0.26)}
        <rect x="${-w * 0.1}" y="${h * 0.52}" width="${w * 1.2}" height="${h * 0.004}" fill="${PALE}" opacity="0.18" transform="rotate(-6 ${w / 2} ${h / 2})"/>
        ${bokeh(w, h, 18, seed + 11)}`,
    }),

  /** Retrato: figura unica, luz de recorte. */
  portrait: ({ w, h, seed }) =>
    frame({
      w,
      h,
      defs: light("l1", COLD, 0.36) + light("l2", PALE, 0.42) + light("l3", WARM, 0.18),
      body: `
        ${blob("l1", w * 0.5, h * 0.3, w * 0.55, h * 0.4)}
        ${blob("l3", w * 0.12, h * 0.78, w * 0.3, h * 0.3)}
        ${bokeh(w, h, 9, seed + 13)}
        <g fill="#05060a" filter="url(#soft)">
          <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.17}"/>
          <path d="M${w * 0.14} ${h * 1.05} q0 -${h * 0.32} ${w * 0.36} -${h * 0.32}
                   q${w * 0.36} 0 ${w * 0.36} ${h * 0.32} z"/>
        </g>
        ${blob("l2", w * 0.74, h * 0.34, w * 0.22, h * 0.26)}`,
    }),
};

const PLATES = [
  ["hero-hall", "stage", 1920, 1080, 11],
  ["room-audience", "stage", 1600, 900, 23],
  ["room-table", "room", 1600, 900, 31],
  ["networking-wide", "networking", 1600, 900, 47],
  ["networking-tall", "networking", 1200, 1500, 53],
  ["venue-wide", "venue", 1920, 1080, 61],
  ["venue-tall", "venue", 1200, 1500, 67],
  ["detail-stage", "detail", 1600, 900, 71],
  ["detail-credential", "detail", 1200, 1500, 83],
  ["erick-poster", "portrait", 1600, 900, 97],
  ["speaker-01", "portrait", 1200, 1500, 101],
  ["speaker-02", "portrait", 1200, 1500, 103],
  ["speaker-03", "portrait", 1200, 1500, 107],
  ["speaker-04", "portrait", 1200, 1500, 109],
];

mkdirSync(OUT, { recursive: true });
for (const [name, scene, w, h, seed] of PLATES) {
  writeFileSync(join(OUT, `${name}.svg`), scenes[scene]({ w, h, seed }), "utf8");
}
console.log(`${PLATES.length} placas geradas em public/mock/`);
