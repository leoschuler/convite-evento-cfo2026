"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EVENT, TOPICS } from "@/lib/event";

const ROWS = [
  { speed: -28, klass: "text-bone/85" },
  { speed: 20, klass: "text-bone/35" },
  { speed: -14, klass: "text-bone/60" },
  { speed: 34, klass: "text-bone/20" },
];

/** Transição — das pessoas para as ideias. */
export default function TopicsMarquee() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });

      gsap.utils.toArray<HTMLElement>(".t-row").forEach((row, i) => {
        tl.fromTo(row, { xPercent: 0 }, { xPercent: ROWS[i].speed, ease: "none", duration: 1 }, 0);
      });

      tl.to(".t-rows", { opacity: 0, filter: "blur(14px)", duration: 0.22, ease: "power2.in" }, 0.72)
        .fromTo(
          ".t-final",
          { opacity: 0, scale: 0.86, filter: "blur(14px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "power3.out" },
          0.78,
        )
        .to(".t-final", { opacity: 0, scale: 1.06, duration: 0.16, ease: "power2.in" }, 0.98);
    },
    { scope: root, dependencies: [reduced] },
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-8 gap-y-3">
          {TOPICS.map((t) => (
            <span key={t} className="text-[clamp(1.2rem,3.4vw,2.4rem)] font-medium tracking-[-0.03em] text-bone/60">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-14 text-center">
          <span className="metal-text text-[clamp(1.8rem,7vw,5rem)] font-medium tracking-[-0.04em]">
            {EVENT.name}
          </span>
          <div className="label mt-5">{EVENT.tagline}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-[180vh] md:h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="t-rows fade-x space-y-1 md:space-y-3">
          {ROWS.map((r, i) => (
            <div key={i} className="t-row flex w-max gap-8 whitespace-nowrap md:gap-14">
              {[0, 1, 2].map((rep) => (
                <span key={rep} className="flex gap-8 md:gap-14">
                  {rotate(TOPICS, i * 3).map((t) => (
                    <span
                      key={`${rep}-${t}`}
                      className={`text-[clamp(1.6rem,5.6vw,4.4rem)] font-medium tracking-[-0.03em] ${r.klass}`}
                    >
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="t-final pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center opacity-0">
          <span className="metal-text text-[clamp(2rem,9vw,7rem)] font-medium tracking-[-0.04em]">{EVENT.name}</span>
          <span className="label">{EVENT.tagline}</span>
        </div>
      </div>
    </div>
  );
}

const rotate = <T,>(arr: T[], n: number) => [...arr.slice(n % arr.length), ...arr.slice(0, n % arr.length)];
