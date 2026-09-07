"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EVENT, TIERS } from "@/lib/event";
import { PHOTOS } from "@/lib/media";
import { companyArticle, inviteCode } from "@/lib/format";
import { useInvite } from "../InviteProvider";
import Plate from "../Plate";

/**
 * Hero sobre a foto real da plenária 2025.
 * A sala existe, tem 1.500 pessoas, e o nome do convidado entra por cima dela.
 */
export default function HeroReal() {
  const { invitation, tierLabel, entered } = useInvite();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (!entered || reduced) {
        gsap.set(el.querySelectorAll("[data-h]"), { opacity: 1, y: 0 });
        gsap.set(el.querySelectorAll(".h-line > span"), { yPercent: 0 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
        .fromTo(".hero-img img", { scale: 1.22 }, { scale: 1, duration: 3 }, 0)
        .fromTo(".hero-veil", { opacity: 1 }, { opacity: 0, duration: 1.8, ease: "power2.out" }, 0)
        .fromTo(".h-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.25)
        .fromTo("[data-h]", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09 }, 0.6);

      gsap.to(".hero-img", {
        opacity: 0.2,
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    },
    { scope: root, dependencies: [entered, reduced] },
  );

  return (
    <div ref={root} className="relative min-h-[100svh] w-full overflow-hidden">
      <Plate
        src={PHOTOS.plenaria.src}
        alt={PHOTOS.plenaria.alt}
        priority
        className="hero-img absolute inset-0 h-full w-full"
      />
      <div className="hero-veil pointer-events-none absolute inset-0 bg-night" aria-hidden />

      {/* legibilidade sem chapar a foto */}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/35" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/40 to-transparent" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{ background: "linear-gradient(to top, rgba(10,124,255,0.10), transparent)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-14 pt-32 md:px-10 lg:px-16 lg:pb-20">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3" data-h>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={EVENT.logo} alt="CFO Insights 2026" className="h-6 w-auto md:h-7" />
          <span className="h-4 w-px bg-edge" aria-hidden />
          <span className="label-bright">{EVENT.edition}</span>
        </div>

        <h1 className="display mt-9 max-w-[14ch] text-[clamp(2.7rem,8.4vw,7.5rem)]">
          <span className="h-line line-mask">
            <span>{invitation.guest_first_name},</span>
          </span>
          <span className="h-line line-mask">
            <span>
              este lugar <span className="brand-text">é seu</span>.
            </span>
          </span>
        </h1>

        <p className="mt-8 max-w-[48ch] text-[1.05rem] leading-relaxed text-frost/75" data-h>
          Um convite pessoal de {EVENT.ceo} para {invitation.guest_name}
          {invitation.company_name
            ? `, ${companyArticle(invitation.company_gender)} ${invitation.company_name}`
            : ""}
          .
        </p>

        <div
          className="mt-12 flex flex-wrap items-center gap-x-9 gap-y-4 border-t border-edge pt-7"
          data-h
        >
          <Tag label="Quando" value={EVENT.dateShort} bright />
          <Tag label="Onde" value={`${EVENT.venue} · ${EVENT.city}`} bright />
          <Tag label="Acesso" value={ TIERS[invitation.invite_tier].label + " ou " + TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <Tag label="Convite" value={inviteCode(invitation.guest_id)} />
        </div>

        <div className="mt-10 flex items-center gap-3 text-dim" data-h>
          <span className="label">Role para começar</span>
          <span className="h-px w-10 bg-edge" aria-hidden />
          <span className="animate-bounce text-xs" aria-hidden>
            ↓
          </span>
        </div>
      </div>
    </div>
  );
}

function Tag({ label, value, bright = false }: { label: string; value: string; bright?: boolean }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="label">{label}</span>
      <span
        className={`font-mono text-[0.66rem] uppercase tracking-[0.16em] ${bright ? "text-cyan" : "text-frost/80"}`}
      >
        {value}
      </span>
    </div>
  );
}
