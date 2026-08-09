"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EVENT_GALLERY } from "@/lib/media";
import { MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

/** Colunas em velocidades diferentes — o mesmo scroll, três profundidades. */
const COLUMNS = [
  { items: [0, 3], shift: -70 },
  { items: [1, 4], shift: 40 },
  { items: [2, 5], shift: -30 },
];

export default function EventGallery() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      gsap.utils.toArray<HTMLElement>(".eg-col").forEach((col, i) => {
        gsap.fromTo(
          col,
          { y: -COLUMNS[i].shift },
          {
            y: COLUMNS[i].shift,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div className="relative">
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 pt-[14vh] md:px-10 lg:px-16">
        <span className="label" data-reveal>
          Inside
        </span>
        <MaskLine as="h2" className="display mt-6 max-w-[18ch] text-[clamp(1.9rem,4.6vw,3.4rem)]">
          O que acontece lá dentro.
        </MaskLine>
      </Reveal>

      <div ref={root} className="mx-auto mt-14 w-full max-w-[1440px] px-6 pb-[14vh] md:px-10 lg:px-16">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {COLUMNS.map((col, ci) => (
            <div key={ci} className={`eg-col flex flex-col gap-6 md:gap-8 ${ci === 1 ? "md:mt-[8vh]" : ""}`}>
              {col.items.map((idx) => {
                const g = EVENT_GALLERY[idx];
                if (!g) return null;
                return (
                  <figure key={g.kicker} className="group" data-cursor="VER">
                    <Plate
                      src={g.src}
                      alt={g.alt}
                      className={g.tall ? "aspect-[4/5] w-full" : "aspect-[16/11] w-full"}
                    />
                    <figcaption className="mt-4 flex items-baseline gap-3">
                      <span className="label">{g.kicker}</span>
                      <span className="h-px w-5 bg-edge" aria-hidden />
                      <span className="text-sm text-frost/55 transition-colors duration-500 group-hover:text-frost">
                        {g.caption}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
