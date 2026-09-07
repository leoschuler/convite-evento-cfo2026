"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { docHash, initials, inviteCode } from "@/lib/format";
import { EVENT, RELATIONSHIP_LOGOS, TIERS } from "@/lib/event";
import { scrollToId } from "@/lib/scroll";
import type { Invitation } from "@/lib/types";
import { useInvite } from "./InviteProvider";


/**
 * Abertura cinematográfica. Nada da página é revelado antes daqui.
 * Sequência: marca → validação → convite localizado → nome → CTA → split de painéis.
 */
export default function InviteGate() {
  const { invitation, enter, ev, tierLabel, status } = useInvite();
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const returning = status === "ACCEPTED";

  useEffect(() => {
    // Quem já aceitou não passa pelo gate: vai direto para a confirmação, sem lock de scroll.
    if (returning) return;
    // O navegador restaura o scroll ao recarregar; a experiência precisa recomeçar do topo.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.body.dataset.locked = "true";
    ev("invite_page_view");
    return () => {
      document.body.dataset.locked = "false";
    };
  }, [ev, returning]);

  useEffect(() => {
    if (!returning) return;
    enter();
    ev("invite_gate_skipped");
    requestAnimationFrame(() => scrollToId("confirmation"));
  }, [returning, enter, ev]);

  useGSAP(
    () => {
      if (returning) return;
      const reduced = prefersReducedMotion();

      gsap.set(".g-stage-2", { opacity: 0, pointerEvents: "none" });

      if (reduced) {
        gsap.set([".g-stage-1"], { display: "none" });
        gsap.set(".g-stage-2", { opacity: 1, pointerEvents: "auto" });
        gsap.set([".g-name > span", ".g-list > span"], { yPercent: 0 });
        gsap.set([".g-rule", ".g-brand", ".g-access", ".g-support", ".g-cta", ".g-hint"], {
          opacity: 1,
          scaleX: 1,
          y: 0,
        });
        ev("invite_gate_opened");
        return;
      }

      const t = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => ev("invite_gate_opened") });
      t.timeScale(1.15);
      tl.current = t;

      t.fromTo(".g-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power3.inOut" }, 0.15)
        .fromTo(".g-brand", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 }, 0.4)
        .fromTo(".g-access", { opacity: 0 }, { opacity: 1, duration: 1 }, 0.85)
        .fromTo(".g-validate", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2)
        .fromTo(".g-scan", { scaleX: 0 }, { scaleX: 1, duration: 1.25, ease: "power2.inOut" }, 1.3)
        .fromTo(".g-meta-row", { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.16 }, 1.5)
        .to(".g-validate", { opacity: 0, duration: 0.45, ease: "power2.in" }, 2.6)
        .fromTo(".g-found", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.9 }, 2.8)
        .to(".g-found", { opacity: 0, duration: 0.5, ease: "power2.in" }, 3.7)
        .set(".g-stage-1", { display: "none" }, 4.2)
        .set(".g-stage-2", { opacity: 1, pointerEvents: "auto" }, 3.95)
        .fromTo(".g-name > span", { yPercent: 118 }, { yPercent: 0, duration: 1.5 }, 3.95)
        .fromTo(".g-list > span", { yPercent: 118 }, { yPercent: 0, duration: 1.5 }, 4.45)
        .fromTo(".g-support", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1 }, 5.05)
        .fromTo(".g-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1 }, 5.35)
        .fromTo(".g-hint", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 5.7);
    },
    { scope: root, dependencies: [] },
  );

  const skip = () => tl.current?.progress(1);

  const handleEnter = () => {
    if (leaving) return;
    setLeaving(true);

    if (prefersReducedMotion()) {
      enter();
      setGone(true);
      return;
    }

    gsap
      .timeline({
        defaults: { ease: "expo.inOut" },
        onComplete: () => {
          enter();
          setGone(true);
        },
      })
      .to(".g-stage-2", { opacity: 0, y: -18, filter: "blur(6px)", duration: 0.6, ease: "power2.in" })
      .to([".g-top-bar", ".g-hint"], { opacity: 0, duration: 0.4 }, "<")
      .fromTo(".g-seam", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.85 }, "-=0.25")
      .to(".g-seam", { opacity: 0, duration: 0.5 }, "-=0.15")
      .to(".g-panel-top", { yPercent: -100, duration: 1.15 }, "-=0.55")
      .to(".g-panel-bottom", { yPercent: 100, duration: 1.15 }, "<");
  };

  // Quem já aceitou nunca chega a renderizar o gate — ver o efeito de "invite_gate_skipped" acima.
  if (returning || gone) return null;

  const headline = `${invitation.guest_first_name},`;
  const subline = "seu nome está na lista.";
  const support = `${EVENT.ceo} reservou pessoalmente um lugar para você no ${EVENT.name}.`;
  const cta = "ACESSAR MEU CONVITE";

  return (
    <div ref={root} className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="Convite privado">
      <div className="g-panel-top absolute inset-x-0 top-0 h-1/2 bg-void" />
      <div className="g-panel-bottom absolute inset-x-0 bottom-0 h-1/2 bg-void" />
      <div className="g-seam absolute left-1/2 top-1/2 h-px w-[70vw] max-w-[820px] origin-center -translate-x-1/2 scale-x-0 bg-gradient-to-r from-transparent via-platinum to-transparent opacity-0" />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(140,150,170,0.10) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="grain absolute inset-0" aria-hidden />
      </div>

      {/* topo */}
      <div className="g-top-bar absolute inset-x-0 top-0 px-6 pt-8 md:px-10 md:pt-10">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-4">
          <div className="g-rule h-px w-full origin-center scale-x-0 bg-gradient-to-r from-transparent via-line to-transparent" />
          <div className="flex flex-col items-center gap-2">
            <span className="g-brand font-mono text-[0.68rem] uppercase tracking-[0.42em] text-bone opacity-0">
              CFO Insights
            </span>
            <span className="g-access label opacity-0">Private Access</span>
          </div>
        </div>
      </div>

      {/* estágio 1 — validação */}
      <div className="g-stage-1 pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <div className="g-validate w-full max-w-[380px] opacity-0">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="h-1 w-1 rounded-full bg-ember"
              style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }}
            />
            <span className="label-bright">Validando convite</span>
          </div>
          <div className="mb-5 h-px w-full bg-line/60">
            <div className="g-scan h-px w-full origin-left scale-x-0 bg-platinum" />
          </div>
          <div className="space-y-2">
            {[
              ["SLUG", invitation.invite_slug],
              ["CODE", inviteCode(invitation.guest_id)],
              ["HASH", docHash(invitation.invite_slug, 8)],
            ].map(([k, v]) => (
              <div key={k} className="g-meta-row flex items-center justify-between opacity-0">
                <span className="label">{k}</span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-bone/70">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="g-found absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center opacity-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3.5 9.4 7 12.9 14.5 5.4" stroke="#d8d2c6" strokeWidth="1" />
          </svg>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-bone">Convite localizado</span>
          <span className="label mt-1">Access granted to {invitation.guest_name}</span>
        </div>
      </div>

      {/* estágio 2 — reconhecimento */}
      <div className="g-stage-2 absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-[1100px]">
          <h1 className="display text-[clamp(2.75rem,11vw,8.5rem)]">
            <span className="g-name line-mask">
              <span>
                {headline}
                <PairAvatars invitation={invitation} />
              </span>
            </span>
            <span className="g-list line-mask text-bone/55">
              <span>{subline}</span>
            </span>
          </h1>

          <p className="g-support mt-8 max-w-[46ch] text-[0.95rem] leading-relaxed text-ash md:text-base">{support}</p>

          <div className="g-cta mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
            <EnterButton label={cta} onClick={handleEnter} />
            <div className="flex items-center gap-3">
              <span className="label">{TIERS[invitation.invite_tier].value}</span>
              <span className="h-3 w-px bg-line" aria-hidden />
              <span className="label">{inviteCode(invitation.guest_id)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* rodapé do gate */}
      <div className="g-hint absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-6 pb-7 opacity-0 md:px-10 md:pb-9">
        <span className="label flex max-w-[60%] items-center gap-3">
          <span>Convite emitido para {invitation.company_name}</span>
          {invitation.company_logo && (
            // Logo na mesma tonalidade da fonte: dessaturado e no mesmo peso visual do texto.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={invitation.company_logo}
              alt={invitation.company_name}
              className="h-4 w-auto opacity-60 grayscale md:h-5"
            />
          )}
        </span>
        {!leaving && (
          <button
            type="button"
            onClick={skip}
            className="label transition-colors hover:text-bone"
            data-cursor="PULAR"
          >
            Pular abertura
          </button>
        )}
      </div>
    </div>
  );
}

/** Erick, a empresa que criou o vínculo e o convidado — sem sobrepor os retratos. */
function PairAvatars({ invitation }: { invitation: Invitation }) {
  const erick = invitation.erick_photo?.trim() || EVENT.ceoPhoto;
  const relationshipLogo = invitation.relationship_brand
    ? RELATIONSHIP_LOGOS[invitation.relationship_brand]
    : invitation.company_logo;
  const relationshipName = invitation.relationship_brand || invitation.company_name;

  return (
    <span
      className="ml-[0.3em] inline-flex shrink-0 translate-y-[-0.06em] items-center align-middle"
      aria-label={`${EVENT.ceo}, ${relationshipName} e ${invitation.guest_name}`}
    >
      <Avatar src={erick} fallback={initials(EVENT.ceo)} title={EVENT.ceo} objectY="26%" />
      <span className="relative mx-[0.08em] flex h-[0.38em] w-[0.68em] items-center justify-center">
        <span className="absolute inset-x-[-0.1em] top-1/2 h-px bg-gradient-to-r from-bone/10 via-bone/45 to-bone/10" />
        <span className="relative flex h-[0.3em] w-[0.54em] items-center justify-center rounded-[0.05em] border border-line bg-void px-[0.055em] shadow-[0_0_0.18em_rgba(0,0,0,0.45)]">
          {relationshipLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={relationshipLogo} alt={relationshipName} className="max-h-[75%] max-w-full object-contain" />
          ) : (
            <span className="font-mono text-[0.1em] tracking-[0.08em] text-bone/65">
              {initials(relationshipName)}
            </span>
          )}
        </span>
      </span>
      <Avatar src={invitation.guest_photo} fallback={initials(invitation.guest_name)} title={invitation.guest_name} />
    </span>
  );
}

function Avatar({
  src,
  fallback,
  title,
  objectY = "32%",
}: {
  src: string | null;
  fallback: string;
  title: string;
  objectY?: string;
}) {
  return (
    <span className="relative block h-[0.58em] w-[0.58em] overflow-hidden rounded-full bg-graphite ring-[0.02em] ring-void">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          style={{ objectPosition: `50% ${objectY}` }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-mono text-[0.2em] tracking-[0.05em] text-bone/70">
          {fallback}
        </span>
      )}
    </span>
  );
}

function EnterButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="ENTRAR"
      className="group relative overflow-hidden border border-line px-8 py-4 transition-colors duration-500 hover:border-bone/60"
    >
      <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
      <span className="relative flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-bone transition-colors duration-500 group-hover:text-void">
        {label}
        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
      </span>
    </button>
  );
}
