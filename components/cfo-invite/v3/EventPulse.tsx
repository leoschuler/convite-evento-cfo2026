"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EVENT, FACTS } from "@/lib/event";
import { PHOTOS } from "@/lib/media";
import { MaskLine } from "../primitives";
import Plate from "../Plate";

/** O claim oficial do evento e os números reais, sobre a foto da plenária. */
export default function EventPulse() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (reduced) {
        gsap.set(el.querySelectorAll("[data-p]"), { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        el.querySelectorAll("[data-p]"),
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        },
      );

      gsap.fromTo(
        el.querySelectorAll(".p-bar"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 74%", once: true },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} className="relative overflow-hidden border-y border-edge">
      <Plate
        src={PHOTOS.plenaria.src}
        alt={PHOTOS.plenaria.alt}
        parallax={9}
        className="absolute inset-0 h-full w-full opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night via-night/80 to-night" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-[14vh] md:px-10 lg:px-16">
        <span className="label" data-p>
          {EVENT.edition} · {EVENT.dateShort} · {EVENT.venue}
        </span>

        <MaskLine as="h2" className="display mt-8 max-w-[20ch] text-[clamp(1.8rem,4.6vw,3.7rem)]">
          {EVENT.claim}
        </MaskLine>

        <p className="mt-8 max-w-[54ch] text-[1.02rem] leading-relaxed text-frost/70" data-p>
          {EVENT.promise}
        </p>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} data-p>
              <div className="h-px w-full bg-edge">
                <div className="p-bar h-px w-full origin-left scale-x-0 bg-gradient-to-r from-azure to-cyan" />
              </div>
              <dt className="mt-6 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-none tracking-[-0.04em] text-frost">
                {f.value}
              </dt>
              <dd className="label mt-4">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
