"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

const WORDS = ["UM INGRESSO", "UM CONVITE", "UMA EXPERIÊNCIA"];

/**
 * Momento 03 — o objeto muda de natureza conforme o scroll.
 * Sticky + scrub em vez de pin: sem pin-spacer, sem layout shift, funciona com Lenis.
 */
export default function Metamorphosis() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const words = gsap.utils.toArray<HTMLElement>(".m-word");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      words.forEach((w, i) => {
        const at = i * 1;
        tl.fromTo(
          w,
          { opacity: 0, yPercent: 45, filter: "blur(12px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" },
          at,
        );
        if (i < words.length - 1) {
          tl.to(w, { opacity: 0, yPercent: -45, filter: "blur(12px)", duration: 0.45, ease: "power2.in" }, at + 0.55);
        }
      });

      tl.fromTo(".m-rule", { scaleX: 0 }, { scaleX: 1, duration: words.length, ease: "none" }, 0);
    },
    { scope: root, dependencies: [reduced] },
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] text-center md:px-10">
        <span className="label">O que você recebeu</span>
        <div className="mt-10 space-y-3">
          {WORDS.map((w, i) => (
            <div
              key={w}
              className={`text-[clamp(1.6rem,6vw,4rem)] font-medium tracking-[-0.03em] ${
                i === WORDS.length - 1 ? "metal-text" : "text-bone/45"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-[200vh] md:h-[280vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <span className="label mb-10">O que você recebeu</span>

        <div className="relative flex h-[22vh] w-full items-center justify-center">
          {WORDS.map((w, i) => (
            <span
              key={w}
              className={`m-word absolute text-center text-[clamp(1.8rem,7vw,5.5rem)] font-medium tracking-[-0.03em] ${
                i === WORDS.length - 1 ? "metal-text" : "text-bone"
              }`}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="mt-10 h-px w-full max-w-[520px] bg-line/50">
          <div className="m-rule h-px w-full origin-left scale-x-0 bg-platinum/70" />
        </div>
      </div>
    </div>
  );
}
