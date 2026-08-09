"use client";

import { EVENT } from "@/lib/event";
import { inviteCode } from "@/lib/format";
import { PHOTOS } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import PersonalizedTicket from "../PersonalizedTicket";
import { MaskLine, Marker, Reveal } from "../primitives";
import Plate from "../Plate";

/** O nome entra na lista sobre a foto da sala onde ele vai estar. */
export default function ConfirmationReal() {
  const { invitation, tierLabel } = useInvite();

  return (
    <section id="confirmation" className="scroll-mt-16">
      <div className="relative min-h-[76svh] w-full overflow-hidden">
        <Plate
          src={PHOTOS.plenaria.src}
          alt={PHOTOS.plenaria.alt}
          parallax={8}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/45" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-[50vh]"
          style={{ background: "linear-gradient(to top, rgba(10,124,255,0.16), transparent)" }}
          aria-hidden
        />

        <Reveal className="relative mx-auto flex min-h-[76svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-16 pt-32 md:px-10 lg:px-16">
          <span className="label" data-reveal>
            Confirmed / {inviteCode(invitation.guest_id)}
          </span>

          <MaskLine as="h2" className="brand-text display mt-8 max-w-[13ch] text-[clamp(2.2rem,7.5vw,6rem)]">
            Pronto. Seu lugar está guardado.
          </MaskLine>

          <p className="mt-8 max-w-[48ch] text-[1.05rem] leading-relaxed text-frost/75" data-reveal>
            {invitation.guest_first_name}, {EVENT.ceo} vai saber que você disse sim. Nos vemos em{" "}
            {EVENT.dateShort.toLowerCase()}, no {EVENT.venue}.
          </p>
        </Reveal>
      </div>

      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[12vh] md:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
          <div>
            <div className="grid max-w-[560px] gap-3" data-reveal>
              <Marker label="Convidado" value={invitation.guest_name} />
              <Marker label="Empresa" value={invitation.company_name} />
              <Marker label="Acesso" value={tierLabel} />
              <Marker label="Evento" value={EVENT.date} />
              <Marker label="Local" value={`${EVENT.venue} — ${EVENT.city}`} />
              <Marker label="Status" value="Confirmed" />
            </div>

            <p className="mt-12 max-w-[46ch] text-sm leading-relaxed text-frost/45" data-reveal>
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
