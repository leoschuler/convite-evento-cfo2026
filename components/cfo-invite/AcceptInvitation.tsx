"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { acceptInvitation } from "@/lib/invitations";
import { EVENT } from "@/lib/event";
import { inviteCode } from "@/lib/format";
import type { AcceptPayload } from "@/lib/types";
import { useInvite } from "./InviteProvider";
import { MaskLine, Marker, Reveal } from "./primitives";
import InviteForm from "./InviteForm";

type Phase = "idle" | "authorizing" | "form" | "submitting" | "done";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AcceptInvitation() {
  const { invitation, markAccepted, ev, acceptSignal } = useInvite();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const payload = useRef<AcceptPayload | null>(null);

  // Guarda fora do updater: React invoca updaters mais de uma vez e efeito colateral ali dobra o evento.
  const opened = useRef(false);
  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    ev("invite_accept_clicked");
    document.body.dataset.locked = "true";
    setPhase("authorizing");
  }, [ev]);

  // O CTA flutuante abre o mesmo fluxo, sem duplicar estado.
  useEffect(() => {
    if (acceptSignal > 0) open();
  }, [acceptSignal, open]);

  useEffect(() => {
    if (phase !== "authorizing") return;
    const t = setTimeout(() => setPhase("form"), 1900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => {
      document.body.dataset.locked = "false";
      markAccepted(payload.current!);
      requestAnimationFrame(() =>
        document.getElementById("confirmation")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }, 2400);
    return () => clearTimeout(t);
  }, [phase, markAccepted]);

  const submit = async (data: AcceptPayload) => {
    setError(null);
    setPhase("submitting");
    try {
      await acceptInvitation(invitation.invite_slug, data);
      payload.current = data;
      setPhase("done");
    } catch {
      setError("Não conseguimos confirmar agora. Tente novamente em instantes.");
      setPhase("form");
    }
  };

  return (
    <>
      <Reveal className="flex min-h-[86svh] flex-col justify-center py-[14vh]">
        <div id="accept" className="mx-auto w-full max-w-[900px] scroll-mt-24 text-center">
          <span className="label" data-reveal>
            {inviteCode(invitation.guest_id)} — Executive Guest
          </span>

          <MaskLine as="h2" className="display mt-9 text-[clamp(2.1rem,6vw,5rem)]">
            {invitation.guest_first_name}, nos vemos no {EVENT.name}?
          </MaskLine>

          <div className="mt-14 flex flex-col items-center gap-6" data-reveal>
            <AcceptButton onClick={open} />
            <span className="label">Convite pessoal e intransferível</span>
          </div>

          <div className="mx-auto mt-16 grid max-w-[460px] gap-3 text-left" data-reveal>
            <Marker label="Status" value="Reserved" />
            <Marker label="Authorized by" value={EVENT.ceo} />
          </div>
        </div>
      </Reveal>

      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-void/94 px-6 py-16 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="grain pointer-events-none absolute inset-0" aria-hidden />

            <div className="relative w-full max-w-[720px]">
              <AnimatePresence mode="wait">
                {phase === "authorizing" && <Authorizing key="auth" />}

                {(phase === "form" || phase === "submitting") && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <span className="label">Último passo</span>
                    <h3 className="display mt-6 text-[clamp(1.7rem,4vw,2.8rem)]">
                      {invitation.guest_first_name}, confirme seus dados.
                    </h3>
                    <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ash">
                      Já sabemos quem você é. Só precisamos de como falar com você até o evento.
                    </p>

                    <div className="mt-11">
                      <InviteForm submitting={phase === "submitting"} onSubmit={submit} />
                    </div>

                    {error && (
                      <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ember">{error}</p>
                    )}
                  </motion.div>
                )}

                {phase === "done" && <Accepted key="done" firstName={invitation.guest_first_name} />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AcceptButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-cursor="ACEITAR"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="group relative overflow-hidden border border-bone/45 px-12 py-6 md:px-16"
    >
      <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
      <span className="relative font-mono text-[0.72rem] uppercase tracking-[0.32em] text-bone transition-colors duration-500 group-hover:text-void">
        Aceitar o convite
      </span>
    </motion.button>
  );
}

function Authorizing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto max-w-[420px] text-center"
    >
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="h-1 w-1 rounded-full bg-ember" style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }} />
        <span className="label-bright">Autorizando</span>
      </div>

      <p className="text-[clamp(1.1rem,2.6vw,1.5rem)] tracking-[-0.01em] text-bone">
        Confirmando seu nome na lista…
      </p>

      <div className="mt-8 h-px w-full bg-line/60">
        <motion.div
          className="h-px w-full origin-left bg-platinum"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.7, ease: "easeInOut" }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="label">Status</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember">Authorizing…</span>
      </div>
    </motion.div>
  );
}

function Accepted({ firstName }: { firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="mx-auto max-w-[460px] text-center"
    >
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none" className="mx-auto" aria-hidden>
        <motion.circle
          cx="23"
          cy="23"
          r="21"
          stroke="#2b2e35"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <motion.path
          d="M14 23.6 20.4 30 32 17.6"
          stroke="#d8d2c6"
          strokeWidth="1.25"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        />
      </svg>

      <p className="mt-8 text-[clamp(1.4rem,3.4vw,2rem)] tracking-[-0.02em] text-bone">Convite aceito.</p>
      <p className="mt-4 text-sm leading-relaxed text-ash">{firstName}, será um prazer receber você.</p>
    </motion.div>
  );
}
