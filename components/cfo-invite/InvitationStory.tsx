"use client";

import { EVENT } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Reveal } from "./primitives";

/** Capítulo 01 — a diferença entre campanha e convite. */
export default function InvitationStory() {
  const { invitation } = useInvite();

  return (
    <Reveal className="py-[16vh]">
      <Chapter n="01" title="The Invitation" />

      <div className="space-y-2 text-[clamp(1.9rem,5.2vw,4.2rem)]">
        <MaskLine className="display text-bone/40">Isso não é uma campanha.</MaskLine>
        <MaskLine className="display" delay={0.12}>
          É um convite.
        </MaskLine>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <p className="max-w-[46ch] text-[1.02rem] leading-relaxed text-ash" data-reveal>
          {EVENT.ceo} escolheu pessoalmente algumas pessoas para viver o {EVENT.name} ao lado dele. Ele fez a lista
          nome a nome, e ela é curta.
        </p>

        <div data-reveal>
          <div className="hairline mb-6 w-full" />
          <p className="text-[clamp(1.5rem,3.4vw,2.4rem)] leading-[1.1] tracking-[-0.02em]">
            Você é <span className="serif-accent text-platinum">uma delas</span>.
          </p>
          <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">
            Private invitation / {invitation.guest_name}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
