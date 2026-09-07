"use client";

import type Lenis from "lenis";

/**
 * Lenis assume o controle do scroll a cada frame; scrollIntoView nativo é
 * imediatamente sobrescrito pelo loop dele. Quando Lenis está ativo, o único
 * jeito confiável de navegar é pelo próprio lenis.scrollTo.
 */
let activeLenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null) {
  activeLenis = instance;
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  if (activeLenis) {
    activeLenis.scrollTo(el, { offset, duration: 1.4 });
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
