"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PLATES } from "@/lib/media";
import { useInvite } from "../InviteProvider";
import { Marker } from "../primitives";
import Plate from "../Plate";

/**
 * Uma fresta de imagem no meio do preto que se abre até ocupar a tela inteira.
 * Máscara por width/height (não clip-path): a imagem nunca distorce e o suporte é total.
 */
export default function VenueReveal() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { invitation } = useInvite();

  useGSAP(
    () => {
      if (reduced) return;

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7 },
        })
        .fromTo(
          ".v-mask",
          { width: "18%", height: "7%" },
          { width: "100%", height: "100%", duration: 0.62, ease: "power2.inOut" },
          0,
        )
        .fromTo(".v-inner", { scale: 1.3 }, { scale: 1, duration: 0.62, ease: "power2.inOut" }, 0)
        .fromTo(".v-slit-label", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
        .to(".v-slit-label", { opacity: 0, duration: 0.12, ease: "power2.in" }, 0.3)
        .fromTo(
          ".v-content",
          { opacity: 0, yPercent: 18 },
          { opacity: 1, yPercent: 0, duration: 0.2, ease: "power2.out" },
          0.58,
        );
    },
    { scope: root, dependencies: [reduced] },
  );

  const content = (
    <>
      <span className="label-bright">A casa</span>
      <h2 className="display mt-7 max-w-[16ch] text-[clamp(2rem,6vw,4.8rem)]">
        Um lugar que já <span className="serif-accent text-platinum">diz</span> o que vai acontecer nele.
      </h2>
      <div className="mt-10 grid max-w-[420px] gap-3">
        <Marker label="Local" value={invitation.event_location} />
        <Marker label="Data" value={invitation.event_date} />
      </div>
    </>
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <Plate src={PLATES.venue.src} alt={PLATES.venue.alt} scrim="bottom" className="aspect-[16/9] w-full" />
          <div className="mt-12">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-void">
        <div
          className="v-mask relative overflow-hidden"
          style={{ width: "18%", height: "7%" }}
          data-cursor="A CASA"
        >
          <div className="v-inner absolute left-1/2 top-1/2 h-screen w-screen -translate-x-1/2 -translate-y-1/2">
            <Plate src={PLATES.venue.src} alt={PLATES.venue.alt} className="h-full w-full" />
          </div>
        </div>

        <span className="v-slit-label label absolute left-1/2 top-[calc(50%+6vh)] -translate-x-1/2 whitespace-nowrap opacity-0">
          A casa
        </span>

        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" aria-hidden />

        <div className="v-content absolute inset-0 flex items-end px-6 pb-[12vh] opacity-0 md:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1280px]">{content}</div>
        </div>
      </div>
    </div>
  );
}
