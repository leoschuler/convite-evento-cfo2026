"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NETWORK_COMPANIES, SPONSORS } from "@/lib/event";
import { PHOTOS } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import { Chapter, MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

/**
 * A prova do networking: os nomes que já estiveram na sala.
 * Nada de logos genéricos — os nomes em escala grande é o que impressiona um CFO.
 */
export default function NetworkingWall() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { invitation } = useInvite();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      gsap.fromTo(
        el.querySelectorAll(".n-name"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.025,
          scrollTrigger: { trigger: el.querySelector(".n-grid"), start: "top 85%", once: true },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} className="relative">
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 pt-[14vh] md:px-10 lg:px-16">
        <Chapter n="03" title="The Room" />
        <MaskLine as="h2" className="display max-w-[18ch] text-[clamp(2rem,5.2vw,4rem)]">
          Quem já esteve nesta sala.
        </MaskLine>
        <p className="mt-8 max-w-[50ch] text-[1.02rem] leading-relaxed text-frost/70" data-reveal>
          Estas são empresas que estiveram no CFO Insights 2025. Em 2026, {invitation.company_name} pode estar nesta
          lista.
        </p>
      </Reveal>

      {/* muro de nomes */}
      <div className="n-grid mx-auto mt-16 w-full max-w-[1280px] px-6 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-edge pt-10 md:gap-x-12">
          {NETWORK_COMPANIES.map((c, i) => (
            <span
              key={c}
              className={`n-name font-medium tracking-[-0.03em] transition-colors duration-500 ${
                i % 5 === 0
                  ? "text-[clamp(1.5rem,4vw,3rem)] text-frost"
                  : i % 3 === 0
                    ? "text-[clamp(1.2rem,3vw,2.2rem)] text-frost/55"
                    : "text-[clamp(1rem,2.2vw,1.6rem)] text-frost/35"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/*
        Faixa fotográfica contida: o original tem 768px de largura. Em tela cheia
        ele era esticado ~1,7x e perdia definição; limitado a 1080px fica ~1,4x.
      */}
      <figure className="mx-auto mt-[12vh] w-full max-w-[1080px] px-6 md:px-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Plate
            src={PHOTOS.networking.src}
            alt={PHOTOS.networking.alt}
            parallax={6}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" aria-hidden />
          <div className="pointer-events-none absolute inset-0 border border-edge" aria-hidden />
        </div>
        <figcaption className="mt-6 max-w-[30ch] text-[clamp(1.2rem,2.6vw,1.9rem)] leading-[1.2] tracking-[-0.02em] text-frost">
          A feira de negócios é onde a conversa continua.
        </figcaption>
      </figure>

      {/* patrocinadores */}
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[12vh] md:px-10 lg:px-16">
        <span className="label" data-reveal>
          Patrocinadores 2026
        </span>
        <div className="mt-10 grid gap-px border-t border-edge">
          {SPONSORS.map((s) => (
            <div
              key={s.tier}
              className="flex flex-col gap-3 border-b border-edge py-5 md:flex-row md:items-baseline md:gap-10"
              data-reveal
            >
              <span className="label w-24 shrink-0">{s.tier}</span>
              <span className="flex flex-wrap gap-x-6 gap-y-2">
                {s.names.map((n) => (
                  <span key={n} className="text-[1.05rem] tracking-[-0.01em] text-frost/75">
                    {n}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
