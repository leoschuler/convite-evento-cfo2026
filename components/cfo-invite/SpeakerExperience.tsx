"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { SPEAKERS } from "@/lib/event";
import { initials } from "@/lib/format";
import type { Speaker } from "@/lib/types";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Reveal } from "./primitives";

/** Entrada cinematográfica nos palestrantes. Sem grid de fotos. */
export default function SpeakerExperience() {
  return (
    <div className="relative">
      <Reveal className="px-6 pt-[16vh] md:px-10 lg:px-16">
        <Chapter n="04" title="The Voices" />
        <MaskLine as="h2" className="display max-w-[16ch] text-[clamp(2rem,5.4vw,4.2rem)]">
          Quem vai estar na sala.
        </MaskLine>
        <p className="mt-8 max-w-[46ch] text-[1.02rem] leading-relaxed text-ash" data-reveal>
          Operações que decidem em escala. Cada nome confirmado entra aqui.
        </p>
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
  const { ev } = useInvite();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el.querySelectorAll("[data-s]"), { opacity: 1, y: 0 });
        gsap.set(el.querySelectorAll(".s-line > span"), { yPercent: 0 });
        return;
      }

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true }, defaults: { ease: "expo.out" } })
        .fromTo(".s-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.4 })
        .fromTo("[data-s]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.25);

      gsap.fromTo(
        el.querySelector(".s-media"),
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 },
        },
      );
    },
    { scope: root, dependencies: [] },
  );

  const n = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={root}
      onPointerEnter={() => {
        if (seen.current) return; // um evento por palestrante, não um por passada do mouse
        seen.current = true;
        ev("speaker_interaction", { speaker_company: speaker.company });
      }}
      data-cursor="EXPLORE"
      className="relative border-t border-line/50 px-6 py-[12vh] md:px-10 lg:px-16"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:gap-20">
        <div>
          <div className="mb-8 flex items-center gap-4" data-s>
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

        <div className="s-media relative aspect-[4/5] w-full overflow-hidden" data-s>
          {speaker.photo ? (
            // ponytail: <img> puro — o caminho pode ser remoto; trocar por next/image quando o domínio for fixo.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={speaker.photo}
              alt={speaker.name ?? speaker.company}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover grayscale transition-[filter] duration-700 hover:grayscale-0"
            />
          ) : (
            <Monogram label={speaker.name ?? speaker.company} />
          )}
          <div className="pointer-events-none absolute inset-0 border border-line/60" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Placeholder editorial — nada de "foto em breve". */
function Monogram({ label }: { label: string }) {
  return (
    <div className="relative h-full w-full bg-gradient-to-b from-graphite via-charcoal to-void">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff08 1px, transparent 1px)",
          backgroundSize: "34px 100%",
        }}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-0 h-full w-[55%] -translate-x-1/2"
        style={{ background: "radial-gradient(60% 45% at 50% 30%, rgba(200,206,220,0.13), transparent 70%)" }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[clamp(3rem,9vw,5rem)] font-medium tracking-[-0.04em] text-transparent"
          style={{ WebkitTextStroke: "1px rgba(237,234,227,0.22)" }}
        >
          {initials(label)}
        </span>
      </div>
      <div className="grain absolute inset-0" aria-hidden />
    </div>
  );
}
