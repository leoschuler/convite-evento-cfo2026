"use client";

import { EVENT } from "@/lib/event";
import { inviteCode } from "@/lib/format";
import { PLATES } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import PersonalizedTicket from "../PersonalizedTicket";
import { MaskLine, Marker, Reveal } from "../primitives";
import Plate from "../Plate";

/** Confirmação em tela cheia: o nome entra na lista sobre a imagem da sala. */
export default function ConfirmationCinematic() {
  const { invitation, tierLabel } = useInvite();

  return (
    <section id="confirmation" className="scroll-mt-16">
      <div className="relative min-h-[76svh] w-full overflow-hidden">
        <Plate
          src={PLATES.roomPeople.src}
          alt={PLATES.roomPeople.alt}
          parallax={8}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/40" aria-hidden />

        <Reveal className="relative mx-auto flex min-h-[76svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-16 pt-32 md:px-10 lg:px-16">
          <span className="label" data-reveal>
            Confirmed / {inviteCode(invitation.guest_id)}
          </span>

          <MaskLine as="h2" className="metal-text display mt-8 text-[clamp(2.2rem,8.5vw,7rem)]">
            YOU&apos;RE ON THE LIST.
          </MaskLine>

          <p className="mt-8 max-w-[44ch] text-[1.02rem] leading-relaxed text-bone/75" data-reveal>
            {invitation.guest_first_name}, seu nome está confirmado na lista de convidados de {EVENT.ceo} para o{" "}
            {EVENT.name}.
          </p>
        </Reveal>
      </div>

      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[12vh] md:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
          <div>
            <div className="grid max-w-[560px] gap-3" data-reveal>
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
      </Reveal>
    </section>
  );
}
