"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PLATES } from "@/lib/media";
import Plate from "../Plate";

const BEATS = [
  { word: "Executivos.", plate: PLATES.roomStage },
  { word: "Fundadores.", plate: PLATES.roomTable },
  { word: "CFOs.", plate: PLATES.roomPeople },
  { word: "Líderes que decidem.", plate: PLATES.access },
];

const FINAL_PLATE = PLATES.conversations;

/**
 * Capítulo 03 — a sala existe. Cada palavra troca a cena atrás dela.
 * Sticky + scrub: uma sequência de imagem controlada pelo scroll, sem pin-spacer.
 */
export default function RoomSequence() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.65 },
      });

      const plates = gsap.utils.toArray<HTMLElement>(".rs-plate");
      const words = gsap.utils.toArray<HTMLElement>(".rs-word");

      words.forEach((w, i) => {
        const at = i * 1;

        tl.fromTo(w, { opacity: 0.12, yPercent: 24 }, { opacity: 1, yPercent: 0, duration: 0.45, ease: "power2.out" }, at);
        tl.to(w, { opacity: 0.16, yPercent: -18, duration: 0.45, ease: "power2.in" }, at + 0.62);

        if (i > 0) {
          tl.fromTo(plates[i], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, at - 0.12);
          tl.to(plates[i - 1], { opacity: 0, duration: 0.5, ease: "power1.inOut" }, at - 0.12);
        }
        // respiro contínuo dentro de cada cena
        tl.fromTo(
          plates[i].querySelector("img"),
          { scale: 1.14 },
          { scale: 1.02, duration: 1.2, ease: "none" },
          Math.max(0, at - 0.2),
        );
      });

      const end = words.length;

      tl.fromTo(plates[plates.length - 1], { opacity: 0 }, { opacity: 1, duration: 0.5 }, end - 0.35)
        .to(plates[plates.length - 2], { opacity: 0, duration: 0.5 }, end - 0.35)
        .to(".rs-words", { opacity: 0, duration: 0.35 }, end - 0.3)
        .to(".rs-eyebrow", { opacity: 0, duration: 0.35 }, end - 0.3)
        .fromTo(
          ".rs-final",
          { opacity: 0, yPercent: 22 },
          { opacity: 1, yPercent: 0, duration: 0.6, ease: "power2.out" },
          end,
        );
    },
    { scope: root, dependencies: [reduced] },
  );

  const eyebrow = (
    <div className="rs-eyebrow mb-10 flex flex-wrap items-center gap-4">
      <span className="label-bright">03 — The Room</span>
      <span className="h-px w-10 bg-line" aria-hidden />
      <span className="label">Imagine a sala</span>
    </div>
  );

  const finalBeat = (
    <div className="max-w-[24ch]">
      <div className="display text-[clamp(2rem,6.4vw,5.4rem)]">
        Agora imagine <span className="serif-accent text-platinum">as conversas</span>.
      </div>
      <p className="mt-8 max-w-[44ch] text-[1.02rem] leading-relaxed text-bone/70">
        O que acontece no CFO Insights raramente acontece em auditório. Acontece entre pessoas que decidem.
      </p>
    </div>
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1280px]">
          {eyebrow}
          <div className="grid gap-8 md:grid-cols-2">
            {BEATS.map((b) => (
              <div key={b.word} className="relative">
                <Plate src={b.plate.src} alt={b.plate.alt} scrim="bottom" className="aspect-[16/10] w-full" />
                <div className="display absolute bottom-6 left-6 text-[clamp(1.4rem,3.4vw,2.4rem)]">{b.word}</div>
              </div>
            ))}
          </div>
          <div className="mt-16">{finalBeat}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-[380vh] md:h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {BEATS.map((b, i) => (
          <div key={b.word} className="rs-plate absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
            <Plate src={b.plate.src} alt={b.plate.alt} className="h-full w-full" priority={i === 0} />
          </div>
        ))}
        <div className="rs-plate absolute inset-0" style={{ opacity: 0 }}>
          <Plate src={FINAL_PLATE.src} alt={FINAL_PLATE.alt} className="h-full w-full" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-void/20" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/50" aria-hidden />

        <div className="relative flex h-full items-center px-6 md:px-10 lg:px-16">
          <div className="relative mx-auto w-full max-w-[1280px]">
            {eyebrow}

            <div className="rs-words relative h-[26vh]">
              {BEATS.map((b, i) => (
                <div
                  key={b.word}
                  className="rs-word display absolute inset-x-0 top-0 text-[clamp(2.2rem,8vw,7rem)]"
                  style={{ opacity: i === 0 ? 1 : 0.12 }}
                >
                  {b.word}
                </div>
              ))}
            </div>

            <div className="rs-final pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0">
              {finalBeat}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
