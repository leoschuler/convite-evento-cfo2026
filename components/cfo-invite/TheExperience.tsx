"use client";

import { motion } from "motion/react";
import { EXPERIENCE_PILLARS } from "@/lib/event";
import { Chapter, MaskLine, Reveal } from "./primitives";

export default function TheExperience() {
  return (
    <Reveal className="py-[16vh]">
      <Chapter n="05" title="The Experience" />

      <div className="space-y-2 text-[clamp(1.9rem,5.2vw,4.2rem)]">
        <MaskLine className="display text-bone/40">Não é sobre assistir palestras.</MaskLine>
        <MaskLine className="display" delay={0.12}>
          É sobre <span className="serif-accent text-platinum">estar na conversa</span>.
        </MaskLine>
      </div>

      <div className="mt-20 grid gap-px border-t border-line/60 md:grid-cols-2 lg:grid-cols-3">
        {EXPERIENCE_PILLARS.map((p) => (
          <motion.div
            key={p.k}
            data-reveal
            data-cursor="EXPLORE"
            whileHover={{ backgroundColor: "rgba(23,25,29,0.55)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative border-b border-line/60 px-1 py-10 md:px-7"
          >
            <div className="flex items-baseline gap-4">
              <span className="label">{p.k}</span>
              <span className="text-[1.35rem] tracking-[-0.02em] text-bone">{p.label}</span>
            </div>
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-ash">{p.line}</p>
            <span
              className="absolute bottom-[-1px] left-0 h-px w-0 bg-platinum/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
              aria-hidden
            />
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}
