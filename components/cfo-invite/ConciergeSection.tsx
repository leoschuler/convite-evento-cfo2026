"use client";

import { EVENT } from "@/lib/event";
import { initials, whatsappLink } from "@/lib/format";
import { useInvite } from "./InviteProvider";
import { MaskLine, Reveal } from "./primitives";

/** Depois da confirmação, o convidado não deve precisar resolver mais nada. */
export default function ConciergeSection() {
  const { invitation, status, ev } = useInvite();
  if (status !== "ACCEPTED") return null;

  const name = invitation.concierge_name?.trim() || `Time ${EVENT.name}`;
  const phone = invitation.concierge_whatsapp?.trim() || "";
  const href = phone
    ? whatsappLink(
        phone,
        `Olá, aqui é ${invitation.guest_name}, da ${invitation.company_name}. Confirmei meu convite para o ${EVENT.name}.`,
      )
    : null;

  return (
    <Reveal className="py-[16vh]">
      <MaskLine as="h2" className="display max-w-[18ch] text-[clamp(1.9rem,5vw,3.8rem)]">
        Agora deixe o resto com a gente.
      </MaskLine>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="edge flex items-center gap-6 bg-charcoal/40 p-7 backdrop-blur-sm" data-reveal>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line">
            <span className="font-mono text-[0.66rem] tracking-[0.12em] text-bone/85">{initials(name)}</span>
          </div>
          <div>
            <div className="text-[1.15rem] tracking-[-0.01em] text-bone">{name}</div>
            <div className="label mt-2">Executive Experience — {EVENT.name}</div>
          </div>
        </div>

        <div data-reveal>
          <p className="max-w-[44ch] text-[1.02rem] leading-relaxed text-ash">
            Até o evento, nosso time estará disponível para cuidar da sua experiência.
          </p>

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ev("concierge_clicked")}
              data-cursor="FALAR"
              className="group relative mt-9 inline-flex overflow-hidden border border-line px-9 py-4 transition-colors duration-500 hover:border-bone/60"
            >
              <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <span className="relative font-mono text-[0.66rem] uppercase tracking-[0.28em] text-bone transition-colors duration-500 group-hover:text-void">
                Falar com meu concierge
              </span>
            </a>
          ) : (
            <p className="label mt-9 leading-[1.8]">
              O contato direto do seu concierge chega junto com a confirmação por e-mail.
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}
