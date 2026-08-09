"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SPEAKERS } from "@/lib/event";
import { speakerPlate } from "@/lib/media";
import type { Speaker } from "@/lib/types";
import { useInvite } from "../InviteProvider";
import { Chapter, MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

/** Retratos em escala editorial. A tipografia invade a imagem — não é um card. */
export default function SpeakerGallery() {
  return (
    <div className="relative">
      <Reveal className="px-6 pt-[16vh] md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1280px]">
          <Chapter n="04" title="The Voices" />
          <MaskLine as="h2" className="display max-w-[16ch] text-[clamp(2rem,5.4vw,4.2rem)]">
            Quem vai estar na sala.
          </MaskLine>
          <p className="mt-8 max-w-[46ch] text-[1.02rem] leading-relaxed text-ash" data-reveal>
            Operações que decidem em escala. Cada nome confirmado entra aqui.
          </p>
        </div>
      </Reveal>

      {SPEAKERS.map((s, i) => (
        <SpeakerPanel key={`${s.company}-${i}`} speaker={s} index={i} />
      ))}
    </div>
  );
}

function SpeakerPanel({ speaker, index }: { speaker: Speaker; index: number }) {
  const root = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduced = useReducedMotion();
  const { ev } = useInvite();

  const flipped = index % 2 === 1;
  const src = speaker.photo ?? speakerPlate(index);
  const n = String(index + 1).padStart(2, "0");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (reduced) {
        gsap.set(el.querySelectorAll("[data-s]"), { opacity: 1, y: 0 });
        gsap.set(el.querySelectorAll(".s-line > span"), { yPercent: 0 });
        return;
      }

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 68%", once: true }, defaults: { ease: "expo.out" } })
        .fromTo(".s-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.5 })
        .fromTo("[data-s]", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.25);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div
      ref={root}
      onPointerEnter={() => {
        if (seen.current) return;
        seen.current = true;
        ev("speaker_interaction", { speaker_company: speaker.company });
      }}
      data-cursor="EXPLORE"
      className="group relative border-t border-line/40 px-6 py-[10vh] md:px-10 lg:px-16"
    >
      <div
        className={`mx-auto grid max-w-[1280px] items-center gap-8 lg:gap-16 ${
          flipped ? "lg:grid-cols-[minmax(280px,420px)_1fr]" : "lg:grid-cols-[1fr_minmax(280px,420px)]"
        }`}
      >
        {/* retrato */}
        <div className={`relative ${flipped ? "lg:order-1" : "lg:order-2"}`} data-s>
          <Plate
            src={src}
            alt={speaker.name ?? `Palestrante — ${speaker.company}`}
            parallax={6}
            desaturate
            scrim="bottom"
            className="aspect-[4/5] w-full"
          />
          <div className="pointer-events-none absolute inset-0 border border-line/50" aria-hidden />
          <span
            className="pointer-events-none absolute -left-2 -top-6 text-[clamp(3rem,7vw,5.5rem)] font-medium tracking-[-0.05em] text-transparent md:-left-6"
            style={{ WebkitTextStroke: "1px rgba(237,234,227,0.28)" }}
            aria-hidden
          >
            {n}
          </span>
        </div>

        {/* texto */}
        <div className={flipped ? "lg:order-2" : "lg:order-1"}>
          <div className="mb-7 flex items-center gap-4" data-s>
            <span className="label-bright">{n}</span>
            <span className="h-px w-10 bg-line" aria-hidden />
            <span className="label">{speaker.name ? "Confirmado" : "A ser anunciado"}</span>
          </div>

          <h3 className="s-line line-mask display text-[clamp(2.1rem,7vw,5.6rem)]">
            <span>{speaker.company}</span>
          </h3>

          {speaker.name && (
            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1" data-s>
              <span className="text-lg tracking-[-0.01em] text-bone">{speaker.name}</span>
              {speaker.position && <span className="label">{speaker.position}</span>}
            </div>
          )}

          {speaker.topic && (
            <p
              className="serif-accent mt-9 max-w-[38ch] text-[clamp(1.15rem,2.3vw,1.7rem)] not-italic leading-[1.4] text-bone/70"
              data-s
            >
              {speaker.topic}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
