"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { EVENT } from "@/lib/event";
import { useInvite } from "./InviteProvider";
import { Marker } from "./primitives";

export default function InviteHero({ children }: { children?: React.ReactNode }) {
  const { invitation, tierLabel, entered } = useInvite();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!entered || prefersReducedMotion()) {
        gsap.set(root.current?.querySelectorAll("[data-h]") ?? [], { opacity: 1, y: 0 });
        gsap.set(root.current?.querySelectorAll(".h-line > span") ?? [], { yPercent: 0 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
        .fromTo(".h-line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.4, stagger: 0.12 })
        .fromTo("[data-h]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.45);
    },
    { scope: root, dependencies: [entered] },
  );

  return (
    <div ref={root} className="relative flex min-h-[92svh] flex-col justify-center pt-28 pb-16 lg:min-h-screen">
      <div className="flex items-center gap-4" data-h>
        <span className="label-bright">Executive Guest Experience</span>
        <span className="h-px w-8 bg-line" aria-hidden />
        <span className="label">{EVENT.name}</span>
      </div>

      <h1 className="display mt-8 text-[clamp(2.4rem,7.4vw,6rem)]">
        <span className="h-line line-mask">
          <span>{invitation.guest_first_name},</span>
        </span>
        <span className="h-line line-mask">
          <span>
            este lugar <span className="serif-accent text-platinum">é seu</span>.
          </span>
        </span>
      </h1>

      <p className="mt-8 max-w-[52ch] text-[1.02rem] leading-relaxed text-ash" data-h>
        Um convite pessoal de {EVENT.ceo} para {invitation.guest_name}
        {invitation.company_name ? `, da ${invitation.company_name}` : ""}.
      </p>

      {/* credencial no mobile entra aqui */}
      {children}

      <div className="mt-12 grid max-w-[560px] gap-3" data-h>
        <Marker label="Access" value={tierLabel} />
        <Marker label="Guest of" value={EVENT.ceo} />
        <Marker label="Status" value={invitation.invite_status === "ACCEPTED" ? "Confirmed" : "Reserved"} />
      </div>

      <div className="mt-14 flex items-center gap-3 text-dim" data-h>
        <span className="label">Role para começar</span>
        <span className="h-px w-10 bg-line" aria-hidden />
        <span className="animate-bounce text-xs" aria-hidden>
          ↓
        </span>
      </div>
    </div>
  );
}
