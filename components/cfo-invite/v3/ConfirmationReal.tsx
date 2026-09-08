"use client";

import { EVENT, TIERS } from "@/lib/event";
import { inviteCode, whatsappLink } from "@/lib/format";
import { PHOTOS } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import PersonalizedTicket from "../PersonalizedTicket";
import { MaskLine, Marker, Reveal } from "../primitives";
import Plate from "../Plate";
import { wrap } from "gsap-trial/src/all";

/** O nome entra na lista sobre a foto da sala onde ele vai estar. */
export default function ConfirmationReal() {
  const { invitation, ev  } = useInvite();
const phone_concierge = invitation.concierge_whatsapp?.trim() || "";
  const href_concierge = phone_concierge
    ? whatsappLink(
        phone_concierge,
        `Olá, aqui é ${invitation.guest_name}, da ${invitation.company_name}. Confirmei meu convite para o ${EVENT.name}.`,
      )
    : null;

let link_checkout = new URL(`https://appticket.com.br/cfo-insights-26`);
let link_hash = "";
link_checkout.searchParams.set("utm_campaign", "convite-aceito");
link_checkout.searchParams.set("utm_source", "site-convite");
link_checkout.searchParams.set("utm_medium", "link");
link_checkout.searchParams.set("cupom", TIERS[invitation.invite_tier].cupom);
if( TIERS[invitation.invite_tier].code ){
link_checkout.searchParams.set("t", (TIERS[invitation.invite_tier].code?.toString()) + ":1");
}

link_hash += "nome=" + encodeURIComponent(invitation.guest_name) + "&";
if( !!invitation.guest_whatsapp ) {
  link_hash += "tel=" + encodeURIComponent(invitation.guest_whatsapp) + "&";
}
if( !!invitation.guest_email ) {
  link_hash += "email=" + encodeURIComponent(invitation.guest_email) + "&";
}
link_checkout.hash = link_hash;




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

        <Reveal
          immediate
          className="relative mx-auto flex min-h-[76svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-16 pt-32 md:px-10 lg:px-16"
        >
          <span className="label" data-reveal>
            Confirmed / {inviteCode(invitation.guest_id)}
          </span>

          <MaskLine immediate as="h2" className="brand-text display mt-8 max-w-[13ch] text-[clamp(2.2rem,7.5vw,6rem)]">
            Convite Aceito!
          </MaskLine>
          <MaskLine immediate as="h3" className="brand-text display mt-8 text-[clamp(1.2rem,4.5vw,3rem)]">
            Cupom gerado para {invitation.guest_first_name}.
          </MaskLine>

          <p className="my-1 max-w-[62ch]" style={{ textWrap: "balance", marginTop:"calc(var(--spacing)*5)" }} >
            Você já aceitou nosso convite, mas ainda precisa adquirir seu ingresso tipo {invitation.invite_tier} gratuitamente 
            ou usar o desconto de {TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} em uma compra de maior valor.
          </p>
          <p className="my-1 max-w-[60ch]" style={{textWrap:"balance"}} >
            Clique abaixo para aplicar automaticamente o cupom <strong className="font-bold" style={{ textWrap: "nowrap" }}>{ TIERS[invitation.invite_tier].cupom }</strong> no checkout do site do evento. Ele é pessoal e intransferível.
          </p>
          <p className="my-8 text-[1rem]" >

<a
              href={link_checkout.toString().replace(/%3A/g, ":")}
              target="_blank"
              rel="noopener noreferrer"              
              className="group relative inline-flex overflow-hidden border border-line px-9 py-4 transition-colors duration-500 hover:border-bone/60"
            >
              <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <span className="relative font-mono text-[1.5rem] uppercase tracking-[0.28em] text-bone transition-colors duration-500 group-hover:text-void">
              Clique aqui para adquirir seu ingresso
              </span>
            </a>
          
          </p>


          <div className="grid max-w-[560px] gap-3" >
            <MaskLine immediate as="h3" className="brand-text display mt-8 text-[1.25rem]">
            Ficou Alguma Dúvida?
          </MaskLine>
               <p className="max-w-[60ch] text-[1.02rem] leading-relaxed text-ash">
            Até o evento, nosso time estará disponível para cuidar da sua experiência.
          </p>

          {href_concierge ? (
            <a
              href={href_concierge}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ev("concierge_clicked")}
              data-cursor="FALAR"
              className="group relative mt-4 inline-flex overflow-hidden border border-line px-9 py-4 transition-colors duration-500 hover:border-bone/60"
              style={{textWrap:"balance",minWidth:"fit-content", maxWidth:"fit-content"}}
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

          <p className="mt-8 max-w-[48ch] text-[1.05rem] leading-relaxed text-frost/75">
            {invitation.guest_first_name}, {EVENT.ceo} vai saber que você disse sim. Nos vemos em{" "}
            {EVENT.dateShort.toLowerCase()}, no {EVENT.venue}.
          </p>    

        </div>
      
          
        </Reveal>
      </div>
{ /*
      <Reveal className="mx-auto w-full max-w-[1280px] px-6 py-[12vh] md:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
          <div>
            <div className="grid max-w-[560px] gap-3" data-reveal>
              <Marker label="Convidado" value={invitation.guest_name} />
              <Marker label="Empresa" value={invitation.company_name} />
              <Marker label="Acesso" value={TIERS[invitation.invite_tier].label + " | " + TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
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
      </Reveal> */}
    </section>
  );
}
