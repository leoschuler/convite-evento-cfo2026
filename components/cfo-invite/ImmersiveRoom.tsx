"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

const ROOM = ["Executivos.", "Fundadores.", "CFOs.", "Líderes que decidem."];

/** Capítulo 03 — mudança de atmosfera. A sala se forma palavra a palavra. */
export default function ImmersiveRoom() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const words = gsap.utils.toArray<HTMLElement>(".r-word");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      words.forEach((w, i) => {
        tl.fromTo(
          w,
          { opacity: 0.14, xPercent: -2 },
          { opacity: 1, xPercent: 0, duration: 0.5, ease: "power2.out" },
          i * 0.9,
        );
        tl.to(w, { opacity: 0.22, duration: 0.5, ease: "none" }, i * 0.9 + 0.9);
      });

      const end = words.length * 0.9;

      tl.to(".r-glow", { opacity: 1, scale: 1.15, duration: end, ease: "none" }, 0)
        .to(".r-words", { opacity: 0, yPercent: -8, duration: 0.5 }, end - 0.1)
        .to(".r-eyebrow", { opacity: 0, duration: 0.4 }, end - 0.1)
        .fromTo(
          ".r-final",
          { opacity: 0, yPercent: 30, filter: "blur(10px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.7, ease: "power2.out" },
          end + 0.25,
        );
    },
    { scope: root, dependencies: [reduced] },
  );

  const eyebrow = (
    <div className="r-eyebrow mb-10 flex flex-wrap items-center gap-4">
      <span className="label-bright">03 — The Room</span>
      <span className="h-px w-10 bg-line" aria-hidden />
      <span className="label">Imagine a sala</span>
    </div>
  );

  const finalBeat = (
    <div>
      <div className="display text-[clamp(2rem,6.4vw,5.4rem)]">
        Agora imagine <span className="serif-accent text-platinum">as conversas</span>.
      </div>
      <p className="mt-8 max-w-[44ch] text-[1.02rem] leading-relaxed text-ash">
        O que acontece no CFO Insights raramente acontece em auditório. Acontece entre pessoas que decidem.
      </p>
    </div>
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1280px]">
          {eyebrow}
          <div className="space-y-1">
            {ROOM.map((w) => (
              <div key={w} className="display text-[clamp(2rem,7vw,5rem)] text-bone/70">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-16">{finalBeat}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-[280vh] md:h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-10 lg:px-16">
        <div
          className="r-glow pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 opacity-30"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(160,172,196,0.14) 0%, transparent 68%)" }}
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1280px]">
          {eyebrow}

          <div className="r-words space-y-1 md:space-y-2">
            {ROOM.map((w) => (
              <div key={w} className="r-word display text-[clamp(2.2rem,8vw,7rem)]" style={{ opacity: 0.14 }}>
                {w}
              </div>
            ))}
          </div>

          <div className="r-final pointer-events-none absolute inset-0 flex items-center opacity-0">{finalBeat}</div>
        </div>
      </div>
    </div>
  );
}
