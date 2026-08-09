"use client";

import { EVENT } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Chapter, MaskLine, Marker, Reveal } from "./primitives";

/** Fallback na voz do Erick — primeira pessoa, sempre. */
const FALLBACK =
  "Porque algumas relações vão muito além da prestação de serviços. Elas são construídas ao longo do tempo — e eu faço questão de ter você comigo nesta edição.";

/** Capítulo 02 — transforma convite em reconhecimento. */
export default function WhyYou() {
  const { invitation } = useInvite();
  const reason = invitation.invitation_reason?.trim() || FALLBACK;

  return (
    <Reveal className="py-[16vh]">
      <Chapter n="02" title="Why You" />

      <MaskLine as="h2" className="display text-[clamp(2rem,5.4vw,4.2rem)]">
        Por que você está aqui.
      </MaskLine>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <blockquote className="relative pl-8 md:pl-12" data-reveal>
          <span
            className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-platinum/70 via-line to-transparent"
            aria-hidden
          />
          <p className="serif-accent text-[clamp(1.4rem,3.1vw,2.35rem)] not-italic leading-[1.34] text-bone/92">
            “{reason}”
          </p>
          <footer className="mt-8 flex items-center gap-3">
            <span className="label">{EVENT.ceo}</span>
            <span className="h-px w-8 bg-line" aria-hidden />
            <span className="label">{EVENT.ceoRole}</span>
          </footer>
        </blockquote>

        <div data-reveal>
          <div className="edge bg-charcoal/40 p-7 backdrop-blur-sm">
            <div className="label mb-6">Relacionamento</div>

            <div className="text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-[-0.02em] text-bone">
              {invitation.company_name}
            </div>

            <div className="mt-7 grid gap-3">
              {invitation.relationship_brand && <Marker label="Marca" value={invitation.relationship_brand} />}
              {invitation.relationship_since && (
                <Marker label="Cliente desde" value={invitation.relationship_since} />
              )}
              {invitation.guest_position && <Marker label="Cargo" value={invitation.guest_position} />}
              {invitation.account_executive_name && (
                <Marker label="Executivo" value={invitation.account_executive_name} />
              )}
            </div>

            {invitation.relationship_since && (
              <p className="mt-7 text-sm leading-relaxed text-dim">
                {yearsLine(invitation.relationship_since)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function yearsLine(since: string) {
  const year = Number(since);
  if (!Number.isFinite(year)) return "Uma relação construída ao longo do tempo.";
  const years = new Date().getFullYear() - year;
  if (years <= 1) return "Uma relação que começou há pouco e já chegou até aqui.";
  return `${years} anos de relação — e é por isso que esta conversa faz sentido.`;
}
