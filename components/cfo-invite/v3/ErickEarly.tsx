"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EVENT } from "@/lib/event";
import { useInvite } from "../InviteProvider";
import { MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * O recado do Erick vem cedo, logo depois do hero — é o que dá sentido ao convite.
 * Sempre em primeira pessoa. Sem vídeo cadastrado, o bloco continua de pé com o texto e o retrato.
 */
export default function ErickEarly() {
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
    <Reveal className="relative py-[14vh]">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-20">
        {/* retrato / player */}
        <div className="relative" data-reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden">
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
                className={`absolute inset-0 z-20 h-full w-full object-cover transition-opacity duration-700 ${
                  playing ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              />
            )}

            <Plate
              src={EVENT.ceoPhoto}
              alt={`${EVENT.ceo}, ${EVENT.ceoRole}`}
              className="absolute inset-0 h-full w-full"
            />

            {url && !playing && (
              <button
                type="button"
                onClick={play}
                data-cursor="PLAY"
                aria-label="Reproduzir mensagem do Erick"
                className="group absolute inset-0 z-10 flex items-end justify-center pb-8"
              >
                <span className="flex items-center gap-4 border border-frost/25 bg-night/50 px-6 py-3 backdrop-blur-md transition-all duration-500 group-hover:border-cyan/70 group-hover:bg-night/70">
                  <span className="text-cyan" aria-hidden>
                    ▶
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-frost">
                    Play message
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 border border-edge" aria-hidden />
          <div className="mt-5 flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-cyan" aria-hidden />
            <span className="label-bright">{EVENT.ceo}</span>
            <span className="h-px w-6 bg-edge" aria-hidden />
            <span className="label">{EVENT.ceoRole}</span>
          </div>
        </div>

        {/* mensagem */}
        <div>
          <span className="label" data-reveal>
            Uma palavra do Erick
          </span>

          <MaskLine as="h2" className="display mt-7 max-w-[17ch] text-[clamp(1.9rem,4.6vw,3.6rem)]">
            {invitation.guest_first_name}, eu fiz questão de te chamar.
          </MaskLine>

          <div className="mt-9 max-w-[52ch] space-y-5 text-[1.05rem] leading-[1.65] text-frost/75" data-reveal>
            <p>
              O {EVENT.name} não é um evento que eu organizo e assisto de longe. Eu escolho quem senta nesta sala.
            </p>
            <p>
              Em 2026 a discussão é uma só: toda empresa tem IA, e quase nenhuma tem um CFO que sabe o que fazer com
              ela. Eu quero você nessa conversa —{" "}
              <span className="text-frost">não na plateia, na conversa</span>.
            </p>
          </div>

          <AnimatePresence>
            {ended && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="mt-10"
              >
                <p className="serif-accent text-[clamp(1.3rem,2.6vw,1.9rem)] not-italic leading-[1.3] text-frost">
                  Espero encontrar você lá.
                </p>
                <p className="mt-4 font-mono text-[0.64rem] uppercase tracking-[0.24em] text-cyan">— {EVENT.ceo}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-3" data-reveal>
            <span className="label">Assinado por</span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-frost">
              {EVENT.ceo} — {EVENT.ceoRole}
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
