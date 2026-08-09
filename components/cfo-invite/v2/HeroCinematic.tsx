"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EVENT } from "@/lib/event";
import { PLATES } from "@/lib/media";
import { inviteCode } from "@/lib/format";
import { useInvite } from "../InviteProvider";
import Plate from "../Plate";

/**
 * Hero full-bleed. A imagem é o palco; a tipografia entra por cima.
 * A placa some lentamente conforme o scroll avança — a página "entra" na sala.
 */
export default function HeroCinematic() {
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
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.2 })
        .fromTo(".hero-plate img", { scale: 1.18 }, { scale: 1, duration: 2.6 }, 0)
        .fromTo(".h-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.1)
        .fromTo("[data-h]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.5);

      // A imagem afunda e escurece ao sair — o corte para o preto vira narrativa.
      gsap.to(".hero-plate", {
        opacity: 0.25,
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    },
    { scope: root, dependencies: [entered, reduced] },
  );

  return (
    <div ref={root} className="relative min-h-[100svh] w-full overflow-hidden">
      <Plate
        src={PLATES.hero.src}
        alt={PLATES.hero.alt}
        priority
        scrim="none"
        className="hero-plate absolute inset-0 h-full w-full"
      />
      {/* legibilidade: escurece embaixo e à esquerda, sem chapar a imagem */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-void/85 via-transparent to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-16 pt-32 md:px-10 lg:px-16 lg:pb-24">
        <div className="flex items-center gap-4" data-h>
          <span className="label-bright">Executive Guest Experience</span>
          <span className="h-px w-8 bg-line" aria-hidden />
          <span className="label">{EVENT.name}</span>
        </div>

        <h1 className="display mt-8 max-w-[15ch] text-[clamp(2.6rem,8vw,7rem)]">
          <span className="h-line line-mask">
            <span>{invitation.guest_first_name},</span>
          </span>
          <span className="h-line line-mask">
            <span>
              este lugar <span className="serif-accent text-platinum">é seu</span>.
            </span>
          </span>
        </h1>

        <p className="mt-8 max-w-[46ch] text-[1.02rem] leading-relaxed text-bone/70" data-h>
          Um convite pessoal de {EVENT.ceo} para {invitation.guest_name}
          {invitation.company_name ? `, da ${invitation.company_name}` : ""}.
        </p>

        <div
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line/60 pt-7"
          data-h
        >
          <Tag label="Access" value={tierLabel} />
          <Tag label="Guest of" value={EVENT.ceo} />
          <Tag label="Code" value={inviteCode(invitation.guest_id)} />
          <Tag label="Status" value={invitation.invite_status === "ACCEPTED" ? "Confirmed" : "Reserved"} />
        </div>

        <div className="mt-12 flex items-center gap-3 text-dim" data-h>
          <span className="label">Role para começar</span>
          <span className="h-px w-10 bg-line" aria-hidden />
          <span className="animate-bounce text-xs" aria-hidden>
            ↓
          </span>
        </div>
      </div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="label">{label}</span>
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/85">{value}</span>
    </div>
  );
}
