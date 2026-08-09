"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TIERS } from "@/lib/event";
import { brl } from "@/lib/format";
import { useInvite } from "../InviteProvider";

/** Só aparece depois que o convidado leu de verdade. */
const APPEAR_AT = 0.2;

/**
 * O aceite acompanha o convidado pela página inteira a partir do momento
 * em que ele já andou o suficiente — e some quando a seção de CTA está em tela,
 * para nunca existirem dois botões pedindo a mesma coisa.
 */
export default function FloatingAccept() {
  const { invitation, status, entered, requestAccept, tierLabel } = useInvite();
  const [progress, setProgress] = useState(0);
  const [ctaVisible, setCtaVisible] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entered) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [entered]);

  // Some quando o CTA principal (ou a confirmação) está em tela.
  useEffect(() => {
    if (!entered) return;
    const targets = ["#accept", "#confirmation"]
      .map((s) => document.querySelector(s))
      .filter(Boolean) as Element[];
    if (!targets.length) return;

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setCtaVisible(seen.size > 0);
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [entered, status]);

  const show = entered && status !== "ACCEPTED" && progress > APPEAR_AT && !ctaVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="floating-accept"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[115] px-4 pb-4 md:px-8 md:pb-7"
        >
          <div className="pointer-events-auto relative mx-auto flex w-full max-w-[720px] items-center gap-4 overflow-hidden border border-edge bg-night/80 p-2 pl-5 backdrop-blur-2xl md:gap-6">
            {/* progresso da leitura */}
            <div className="absolute inset-x-0 top-0 h-px bg-edge">
              <div
                ref={bar}
                className="h-px origin-left bg-gradient-to-r from-azure to-cyan transition-transform duration-200"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>

            <div className="min-w-0 flex-1 py-1">
              <div className="label truncate">
                {invitation.guest_first_name} · {tierLabel}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[0.82rem] text-frost/45 line-through">
                  {brl(TIERS[invitation.invite_tier].value)}
                </span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cyan">Cortesia</span>
              </div>
            </div>

            <button
              type="button"
              onClick={requestAccept}
              data-cursor="ACEITAR"
              className="group relative shrink-0 overflow-hidden border border-cyan/40 px-6 py-3.5 transition-colors duration-500 hover:border-cyan md:px-8"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-azure to-cyan transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <span className="relative whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.24em] text-frost transition-colors duration-500 group-hover:text-night">
                Aceitar convite
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
