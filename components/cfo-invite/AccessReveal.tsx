"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { brl, whatsappLink } from "@/lib/format";
import { EVENT } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Reveal } from "./primitives";

/** Reveal do valor. O preço vira percepção — nunca "R$ 0", nunca "100% OFF". */
export default function AccessReveal() {
  const { invitation, tierLabel } = useInvite();
  const root = useRef<HTMLDivElement>(null);

const phone_concierge = invitation.concierge_whatsapp?.trim() || "";
  const href_concierge = phone_concierge
    ? whatsappLink(
        phone_concierge,
        `Olá, aqui é ${invitation.guest_name}, da ${invitation.company_name}. Confirmei meu convite para o ${EVENT.name}.`,
      )
    : null;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(".a-strike", { scaleX: 1 });
        gsap.set([".a-courtesy", ".a-note"], { opacity: 1, y: 0 });
        gsap.set(".a-value", { opacity: 0.35 });
        return;
      }

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 62%", once: true }, defaults: { ease: "expo.out" } })
        .fromTo(".a-value", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1 })
        .to({}, { duration: 0.55 })
        .fromTo(".a-strike", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" })
        .to(".a-value", { opacity: 0.32, duration: 0.8 }, "-=0.55")
        .fromTo(".a-courtesy", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.2 }, "-=0.35")
        .fromTo(".a-note", { opacity: 0 }, { opacity: 1, duration: 0.9 }, "-=0.7");
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div ref={root} className="py-[16vh]">
      <Reveal>
        <Chapter n="07" title="Your Access" />
      </Reveal>

      <MaskLine as="h2" className="display max-w-[16ch] text-[clamp(2rem,5.4vw,4.2rem)]">
        Seu acesso foi reservado.
      </MaskLine>

      <div className="mt-16 flex justify-center">
        <div className="relative w-full max-w-[560px]">
          <div
            className="absolute -inset-px rounded-[2px] opacity-70"
            style={{ background: "linear-gradient(150deg,#2b2e35,#6b6e76 45%,#2b2e35 75%,#4a4d55)" }}
            aria-hidden
          />
          <div className="relative overflow-hidden bg-[#0c0d10] p-8 md:p-10">
            <div className="grain absolute inset-0" aria-hidden />

            <div className="relative">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.34em] text-bone">CFO Insights</span>
                <span className="label">{tierLabel}</span>
              </div>

              <div className="my-8 h-px w-full bg-line/70" />

              <div className="text-[1.5rem] leading-tight tracking-[-0.02em] text-bone">{invitation.guest_name}</div>
              <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ash">
                {invitation.company_name}
              </div>

              <div className="my-9 h-px w-full bg-line/70" />

              <div className="label mb-4">Valor do acesso</div>
              <div className="relative inline-block">
                <span className="a-value block text-[clamp(2.2rem,6vw,3.6rem)] font-medium tracking-[-0.03em] text-bone">
                  {brl(invitation.invite_commercial_value)}
                </span>
                <span
                  className="a-strike absolute left-0 top-1/2 h-px w-full origin-left scale-x-0 bg-platinum"
                  aria-hidden
                />
              </div>

              <div className="a-courtesy mt-9 opacity-0">
                <div className="label mb-4">Sua condição</div>
                <div className="metal-text text-[clamp(1.5rem,4vw,2.4rem)] font-medium tracking-[-0.02em]">
                  CORTESIA INTEGRAL
                </div>
                <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/80">
                  Convidado de {EVENT.ceo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="a-note mx-auto mt-10 max-w-[46ch] text-center text-sm leading-relaxed text-dim opacity-0">
        Este acesso faz parte da lista de convidados do CEO do {EVENT.host}.
      </p>
    </div>
  );
}
