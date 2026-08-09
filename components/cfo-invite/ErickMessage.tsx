"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EVENT } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Reveal } from "./primitives";

/** Uma mensagem do Erick. Vídeo genérico, moldura pessoal. */
export default function ErickMessage() {
  const { invitation, ev } = useInvite();
  const url = invitation.erick_video_url?.trim() || null;
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    if (!url) return;
    setPlaying(true);
    ev("erick_video_started");
    requestAnimationFrame(() => video.current?.play().catch(() => setPlaying(false)));
  };

  return (
    <Reveal className="py-[16vh]">
      <Chapter n="06" title="A Message" />

      <MaskLine as="h2" className="display max-w-[18ch] text-[clamp(2rem,5.4vw,4.2rem)]">
        Uma mensagem do Erick para você.
      </MaskLine>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
        <div
          className="relative aspect-video w-full overflow-hidden bg-charcoal"
          data-reveal
          data-cursor={url ? "PLAY" : undefined}
        >
          {url && (
            <video
              ref={video}
              src={url}
              poster={EVENT.ceoPoster ?? undefined}
              playsInline
              preload="none"
              controls={playing}
              onEnded={() => {
                setEnded(true);
                ev("erick_video_completed");
              }}
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                playing ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          <AnimatePresence>
            {!playing && (
              <motion.button
                type="button"
                onClick={play}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                disabled={!url}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-6 disabled:cursor-default"
                aria-label={url ? "Reproduzir mensagem" : "Mensagem em breve"}
              >
                <Poster />
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-bone/25 transition-all duration-700 group-hover:border-bone/70 group-hover:scale-105">
                  <span className="ml-1 text-bone" aria-hidden>
                    ▶
                  </span>
                </span>
                <span className="relative font-mono text-[0.62rem] uppercase tracking-[0.3em] text-bone/85">
                  {url ? "Play message" : "Mensagem em breve"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div data-reveal>
          <AnimatePresence mode="wait">
            {ended ? (
              <motion.div
                key="signoff"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="serif-accent text-[clamp(1.6rem,3.2vw,2.4rem)] not-italic leading-[1.25] text-bone">
                  Espero encontrar você lá.
                </p>
                <div className="mt-8 h-px w-16 bg-platinum/60" aria-hidden />
                <p className="mt-6 font-mono text-[0.66rem] uppercase tracking-[0.24em] text-bone/85">
                  — {EVENT.ceo}
                </p>
                <p className="label mt-2">{EVENT.ceoRole}</p>
              </motion.div>
            ) : (
              <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <p className="max-w-[38ch] text-[1.02rem] leading-relaxed text-ash">
                  {invitation.guest_first_name}, antes de responder ao convite, ouça o que o {EVENT.ceo} tem a dizer
                  sobre esta edição.
                </p>
                <p className="label mt-8">
                  Gravado para os convidados do {EVENT.name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}

/** Composição de fundo enquanto não há poster real. */
function Poster() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-graphite via-charcoal to-void" aria-hidden />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(45% 60% at 50% 42%, rgba(190,198,214,0.16), transparent 70%)" }}
        aria-hidden
      />
      <div className="grain absolute inset-0" aria-hidden />
      <span className="label absolute left-5 top-5">{EVENT.ceo}</span>
      <span className="label absolute right-5 top-5">{EVENT.ceoRole}</span>
    </>
  );
}
