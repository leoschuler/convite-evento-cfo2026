"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { gendered, whatsappLink } from "@/lib/format";

import { EVENT, TIERS } from "@/lib/event";
import { useInvite } from "../InviteProvider";
import { Chapter, MaskLine, Reveal } from "../primitives";

/**
 * O preço real do ingresso vira percepção de valor.
 * Nunca "R$ 0", nunca "100% OFF" — o valor comercial existe e continua existindo.
 */
export default function AccessRealReveal() {
  const { invitation, tierLabel } = useInvite();
  const root = useRef<HTMLDivElement>(null);
  const tier = TIERS[invitation.invite_tier];
  const benefits = invitation.vip_benefits?.length ? invitation.vip_benefits : tier.benefits;

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
        gsap.set(".ar-strike", { scaleX: 1 });
        gsap.set([".ar-courtesy", ".ar-note"], { opacity: 1, y: 0 });
        gsap.set(".ar-value", { opacity: 0.3 });
        return;
      }

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 62%", once: true }, defaults: { ease: "expo.out" } })
        .fromTo(".ar-value", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 })
        .to({}, { duration: 0.6 })
        .fromTo(".ar-strike", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" })
        .to(".ar-value", { opacity: 0.3, duration: 0.8 }, "-=0.55")
        .fromTo(".ar-courtesy", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2 }, "-=0.35")
        .fromTo(".ar-note", { opacity: 0 }, { opacity: 1, duration: 0.9 }, "-=0.7");
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div ref={root} className="py-[14vh]">
      <Reveal>
        <Chapter n="06" title="Your Access" />
      </Reveal>

      <MaskLine as="h2" className="display max-w-[16ch] text-[clamp(2rem,5.2vw,4rem)]">
        Seu acesso já está pago.
      </MaskLine>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* cartão de valor */}
        <div className="relative">
          <div
            className="absolute -inset-px opacity-80"
            style={{ background: "linear-gradient(150deg,#1e2a3a,#0a7cff 40%,#38cfff 60%,#1e2a3a)" }}
            aria-hidden
          />
          <div className="relative overflow-hidden bg-[#070b12] p-8 md:p-10">
            <div className="grain absolute inset-0" aria-hidden />
            <div
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full"
              style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(10,124,255,0.30), transparent 70%)" }}
              aria-hidden
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-frost">CFO Insights</span>
                <span className="label text-right">{EVENT.dateShort}</span>
              </div>

              <div className="my-8 h-px w-full bg-edge" />

              <div className="text-[1.45rem] leading-tight tracking-[-0.02em] text-frost">
                {invitation.guest_name}
              </div>
              <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-frost/55">
                {invitation.company_name}
              </div>

              <div className="my-9 h-px w-full bg-edge" />

              <div className="label mb-3">Categoria</div>
              <div className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-cyan">{tierLabel}</div>

              <div className="label mb-4 mt-8">Valor do ingresso</div>
              <div className="relative inline-block">
                <span className="ar-value block text-[clamp(2.2rem,6vw,3.6rem)] font-medium tracking-[-0.03em] text-frost">
                  {tier.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <span
                  className="ar-strike absolute left-0 top-1/2 h-px w-full origin-left scale-x-0 bg-cyan"
                  aria-hidden
                />
              </div>

              <div className="ar-courtesy mt-8 opacity-0">
                <div className="label mb-3">Sua condição</div>
                <div className="brand-text text-[clamp(1.5rem,4vw,2.3rem)] font-medium tracking-[-0.02em]">
                  CORTESIA INTEGRAL
                </div>
                <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-frost/70">
                  {gendered(invitation.guest_gender, "Convidado", "Convidada")} de {EVENT.ceo}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* o que o ingresso inclui */}
        <div>
          <span className="label">O que o seu acesso inclui</span>
          <ul className="mt-8 grid gap-px border-t border-edge">
            {benefits.map((b) => (
              <li key={b.title} className="flex items-baseline gap-4 border-b border-edge py-4">
                <span className="text-cyan" aria-hidden>
                  ·
                </span>
                <div>
                  <span className="text-[1.02rem] text-frost">{b.title}</span>
                  {b.description && <p className="mt-1 text-sm leading-relaxed text-frost/50">{b.description}</p>}
                </div>
              </li>
            ))}
          </ul>

          <p className="ar-note mt-10 max-w-[44ch] text-sm leading-relaxed text-frost/45 opacity-0">
            Seu Desconto é do valor integral do ingresso {tierLabel} no site oficial, Ele não foi descontado — ele foi assumido por{" "}
            {EVENT.ceo}.  <br/> Você pode usar esse valor para adquirir gratuitamente o ingresso, ou abater do valor de um ingresso de outra categoria. 
          </p>
        </div>
      </div>
    </div>
  );
}
