"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FEATURED_SPEAKERS, SPEAKERS } from "@/lib/event";
import { initials } from "@/lib/format";
import type { Speaker } from "@/lib/types";
import { useInvite } from "../InviteProvider";
import { Chapter, MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

/**
 * Palestrantes reais, com nome, cargo e empresa exatamente como no site oficial.
 * Destaques em painel editorial; o restante em lista densa — a lista longa é parte do argumento.
 */
export default function SpeakersReal() {
  const rest = SPEAKERS.filter((s) => !s.featured);

  return (
    <div className="relative">
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 pb-[10vh] pt-[14vh] md:px-10 md:pb-[12vh] lg:px-16">
        <Chapter n="04" title="The Voices" />
        <MaskLine as="h2" className="display max-w-[16ch] text-[clamp(2rem,5.2vw,4rem)]">
          Quem sobe ao palco.
        </MaskLine>
        <p className="mt-8 max-w-[48ch] text-[1.02rem] leading-relaxed text-frost/70" data-reveal>
          Mais de 20 especialistas. Operações que decidem em escala, contando o que fizeram e o que aconteceu depois.
        </p>
      </Reveal>

      {FEATURED_SPEAKERS.map((s, i) => (
        <FeaturedPanel key={s.name ?? i} speaker={s} index={i} />
      ))}

      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[12vh] md:px-10 lg:px-16">
        <span className="label" data-reveal>
          Também confirmados
        </span>
        <ul className="mt-10 grid gap-px border-t border-edge sm:grid-cols-2">
          {rest.map((s) => (
            <li
              key={s.name ?? s.company}
              className="flex flex-col gap-1.5 border-b border-edge py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
              data-reveal
            >
              <span className="text-[1.05rem] tracking-[-0.01em] text-frost">{s.name}</span>
              <span className="label sm:text-right">
                {s.position} · {s.company}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

function FeaturedPanel({ speaker, index }: { speaker: Speaker; index: number }) {
  const root = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduced = useReducedMotion();
  const { ev } = useInvite();

  const flipped = index % 2 === 1;
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
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true }, defaults: { ease: "expo.out" } })
        .fromTo(".s-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.4 })
        .fromTo("[data-s]", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.22);
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
      className="group relative border-t border-edge px-6 py-[9vh] md:px-10 lg:px-16"
    >
      <div
        className={`mx-auto grid max-w-[1280px] items-center gap-8 lg:gap-16 ${
          flipped ? "lg:grid-cols-[minmax(240px,340px)_1fr]" : "lg:grid-cols-[1fr_minmax(240px,340px)]"
        }`}
      >
        <div className={`relative ${flipped ? "lg:order-1" : "lg:order-2"}`} data-s>
          {speaker.photo ? (
            <Plate
              src={speaker.photo}
              alt={`${speaker.name}, ${speaker.position} — ${speaker.company}`}
              parallax={5}
              className="aspect-[4/5] w-full"
            />
          ) : (
            <PortraitFallback speaker={speaker} />
          )}
          <div className="pointer-events-none absolute inset-0 border border-edge" aria-hidden />

          {/* selo da marca sobre o retrato */}
          {speaker.logo && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-start">
              <div className="bloom flex items-center bg-night/85 px-5 py-3.5 backdrop-blur-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={speaker.logo} alt={speaker.company} className="h-7 w-auto md:h-9" />
              </div>
            </div>
          )}
        </div>

        <div className={flipped ? "lg:order-2" : "lg:order-1"}>
          <div className="mb-7 flex items-center gap-4" data-s>
            <span className="label-bright">{n}</span>
            <span className="h-px w-10 bg-edge" aria-hidden />
            <span className="label">{speaker.position}</span>
          </div>

          {/* A EMPRESA é o ativo principal — é ela que o convidado reconhece. */}
          <h3 className="s-line line-mask display text-[clamp(2.4rem,9vw,7rem)]">
            <span className="brand-text">{speaker.company}</span>
          </h3>

          {speaker.logo && (
            <div className="mt-7 flex items-center gap-5" data-s>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={speaker.logo} alt={speaker.company} className="h-10 w-auto md:h-12" />
              <span className="h-8 w-px bg-edge" aria-hidden />
              <span className="label">Presente no palco</span>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1" data-s>
            <span className="text-[1.15rem] tracking-[-0.01em] text-frost">{speaker.name}</span>
            <span className="text-dim">·</span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-cyan">{speaker.position}</span>
          </div>

          {speaker.topic && (
            <p
              className="serif-accent mt-8 max-w-[38ch] text-[clamp(1.1rem,2.2vw,1.6rem)] not-italic leading-[1.42] text-frost/70"
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

/** Sem retrato oficial: monograma sobre luz azul. Nada de "foto em breve". */
function PortraitFallback({ speaker }: { speaker: Speaker }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-slate via-night to-night">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(58% 44% at 50% 32%, rgba(10,124,255,0.28), transparent 70%)" }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[clamp(3rem,8vw,4.5rem)] font-medium tracking-[-0.05em] text-transparent"
          style={{ WebkitTextStroke: "1px rgba(233,238,245,0.3)" }}
        >
          {initials(speaker.name ?? speaker.company)}
        </span>
      </div>
      <div className="grain absolute inset-0" aria-hidden />
    </div>
  );
}
