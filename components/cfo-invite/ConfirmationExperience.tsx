"use client";

import { EVENT } from "@/lib/event";
import { inviteCode } from "@/lib/format";
import { useInvite } from "./InviteProvider";
import PersonalizedTicket from "./PersonalizedTicket";
import { MaskLine, Marker, Reveal } from "./primitives";

export default function ConfirmationExperience() {
  const { invitation, tierLabel } = useInvite();

  return (
    <Reveal className="py-[16vh]">
      <div id="confirmation" className="scroll-mt-24">
        <span className="label" data-reveal>
          Confirmed / {inviteCode(invitation.guest_id)}
        </span>

        <MaskLine as="h2" className="metal-text display mt-8 text-[clamp(2.2rem,8vw,6.5rem)]">
          YOU&apos;RE ON THE LIST.
        </MaskLine>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
          <div>
            <p className="max-w-[44ch] text-[1.02rem] leading-relaxed text-ash" data-reveal>
              {invitation.guest_first_name}, seu nome está confirmado na lista de convidados de {EVENT.ceo} para o{" "}
              {EVENT.name}.
            </p>

            <div className="mt-12 grid max-w-[560px] gap-3" data-reveal>
              <Marker label="Convidado" value={invitation.guest_name} />
              <Marker label="Empresa" value={invitation.company_name} />
              <Marker label="Access" value={tierLabel} />
              <Marker label="Evento" value={invitation.event_date} />
              <Marker label="Local" value={invitation.event_location} />
              <Marker label="Status" value="Confirmed" />
            </div>

            <p className="mt-12 max-w-[46ch] text-sm leading-relaxed text-dim" data-reveal>
              Você receberá os detalhes finais por e-mail. Se algo mudar, seu concierge resolve.
            </p>
          </div>

          <div data-reveal>
            <PersonalizedTicket confirmed />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
