"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EVENT } from "@/lib/event";
import { PLATES } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import { Chapter, MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Mesma dramaturgia da v1, agora com moldura fotográfica. */
export default function ErickMessageV2() {
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
        <div className="relative aspect-video w-full overflow-hidden bg-charcoal" data-reveal>
          {url && (
            <video
              ref={video}
              src={url}
              poster={EVENT.ceoPoster ?? PLATES.erick.src}
              playsInline
              preload="none"
              controls={playing}
              onEnded={() => {
                setEnded(true);
                ev("erick_video_completed");
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
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
                transition={{ duration: 0.6, ease: EASE }}
                disabled={!url}
                data-cursor={url ? "PLAY" : undefined}
                className="group absolute inset-0 disabled:cursor-default"
                aria-label={url ? "Reproduzir mensagem" : "Mensagem em breve"}
              >
                <Plate
                  src={EVENT.ceoPoster ?? PLATES.erick.src}
                  alt={PLATES.erick.alt}
                  parallax={5}
                  scrim="full"
                  className="absolute inset-0 h-full w-full"
                />

                <span className="absolute left-5 top-5 z-10 flex items-center gap-3">
                  <span className="label">{EVENT.ceo}</span>
                  <span className="h-px w-6 bg-line" aria-hidden />
                  <span className="label">{EVENT.ceoRole}</span>
                </span>

                <span className="relative z-10 flex h-full flex-col items-center justify-center gap-6">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-bone/30 backdrop-blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:border-bone/80 group-hover:bg-bone/5">
                    <span className="ml-1 text-bone" aria-hidden>
                      ▶
                    </span>
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-bone/85">
                    {url ? "Play message" : "Mensagem em breve"}
                  </span>
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
                transition={{ duration: 1, ease: EASE }}
              >
                <p className="serif-accent text-[clamp(1.6rem,3.2vw,2.4rem)] not-italic leading-[1.25] text-bone">
                  Espero encontrar você lá.
                </p>
                <div className="mt-8 h-px w-16 bg-platinum/60" aria-hidden />
                <p className="mt-6 font-mono text-[0.66rem] uppercase tracking-[0.24em] text-bone/85">— {EVENT.ceo}</p>
                <p className="label mt-2">{EVENT.ceoRole}</p>
              </motion.div>
            ) : (
              <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <p className="max-w-[38ch] text-[1.02rem] leading-relaxed text-ash">
                  {invitation.guest_first_name}, antes de responder ao convite, ouça o que o {EVENT.ceo} tem a dizer
                  sobre esta edição.
                </p>
                <p className="label mt-8">Gravado para os convidados do {EVENT.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}
