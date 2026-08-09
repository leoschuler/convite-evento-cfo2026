"use client";

import { motion } from "motion/react";
import { TRACKS } from "@/lib/event";
import { PHOTOS } from "@/lib/media";
import { Chapter, MaskLine, Reveal } from "../primitives";
import Plate from "../Plate";

/** As 4 trilhas oficiais. É o conteúdo que justifica o convite. */
export default function TracksSection() {
  return (
    <div className="relative">
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[14vh] md:px-10 lg:px-16">
        <Chapter n="05" title="The Agenda" />
        <MaskLine as="h2" className="display max-w-[18ch] text-[clamp(2rem,5.2vw,4rem)]">
          Quatro trilhas. Nenhuma teórica.
        </MaskLine>

        <div className="mt-16 grid gap-px border-t border-edge md:grid-cols-2">
          {TRACKS.map((t) => (
            <motion.article
              key={t.n}
              data-reveal
              data-cursor="TRILHA"
              whileHover={{ backgroundColor: "rgba(11,18,32,0.7)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border-b border-edge px-1 py-10 md:px-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[0.66rem] tracking-[0.2em] text-cyan">{t.n}</span>
                <h3 className="text-[clamp(1.3rem,2.6vw,1.9rem)] tracking-[-0.02em] text-frost">{t.title}</h3>
              </div>
              <p className="label mt-4">{t.subtitle}</p>
              <p className="mt-5 max-w-[38ch] text-[0.98rem] leading-relaxed text-frost/60">{t.line}</p>
              <span
                className="absolute bottom-[-1px] left-0 h-px w-0 bg-gradient-to-r from-azure to-cyan transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                aria-hidden
              />
            </motion.article>
          ))}
        </div>
      </Reveal>

      {/* Transição contida — mesmo motivo da faixa da feira: 768px não aguenta tela cheia. */}
      <div className="mx-auto w-full max-w-[1080px] px-6 pb-[6vh] md:px-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Plate
            src={PHOTOS.palco.src}
            alt={PHOTOS.palco.alt}
            parallax={6}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" aria-hidden />
          <div className="pointer-events-none absolute inset-0 border border-edge" aria-hidden />
        </div>
      </div>
    </div>
  );
}
