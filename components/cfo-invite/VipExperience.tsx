"use client";

import { TIERS } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Reveal } from "./primitives";

/** Só existe para Camarote. Os benefícios vêm do catálogo real de ingressos. */
export default function VipExperience() {
  const { invitation, isVip } = useInvite();
  const benefits = invitation.vip_benefits?.length
    ? invitation.vip_benefits
    : TIERS[invitation.invite_tier].benefits;

  if (!isVip || benefits.length === 0) return null;

  return (
    <Reveal className="py-[16vh]">
      <Chapter n="08" title="VIP Access" />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <MaskLine as="h2" className="metal-text display text-[clamp(2.2rem,6vw,4.6rem)]">
            CAMAROTE
          </MaskLine>
          <p className="mt-8 max-w-[36ch] text-[1.02rem] leading-relaxed text-ash" data-reveal>
            {invitation.guest_first_name}, seu convite é da categoria mais alta do evento. Ele inclui:
          </p>
        </div>

        <ul className="divide-y divide-line/60 border-y border-line/60">
          {benefits.map((b, i) => (
            <li key={b.title} className="flex gap-6 py-7" data-reveal data-cursor="VIP">
              <span className="label pt-1">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="text-[1.25rem] tracking-[-0.02em] text-bone">{b.title}</div>
                {b.description && <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ash">{b.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
