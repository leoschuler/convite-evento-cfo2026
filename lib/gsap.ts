"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 1 });

export { gsap, ScrollTrigger, useGSAP };

/** Divide um texto em <span> por palavra, dentro de linhas mascaráveis. */
export function splitWords(text: string) {
  return text.split(" ").map((w, i) => ({ w, i }));
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
