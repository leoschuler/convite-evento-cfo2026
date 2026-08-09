"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { GALLERY } from "@/lib/media";
import Plate from "../Plate";

/**
 * Faixa horizontal conduzida pelo scroll vertical.
 * A altura do bloco é medida a partir da largura real da faixa: 1px de scroll = 1px de deslocamento.
 */
export default function GalleryScroll() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      const track = el?.querySelector<HTMLElement>(".g-track");
      if (reduced || !el || !track) return;

      let distance = 0;
      const measure = () => {
        distance = Math.max(0, track.scrollWidth - window.innerWidth);
        el.style.height = `${window.innerHeight + distance}px`;
      };
      measure();

      gsap.to(track, {
        x: () => -distance,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <span className="label-bright">Inside</span>
        <h2 className="display mt-6 max-w-[18ch] text-[clamp(1.8rem,4.6vw,3.4rem)]">
          O que acontece lá dentro.
        </h2>
      </div>
      <span className="label hidden md:block">Arraste com o scroll →</span>
    </div>
  );

  if (reduced) {
    return (
      <div className="px-6 py-[14vh] md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1280px]">
          {header}
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g) => (
              <figure key={g.kicker}>
                <Plate src={g.src} alt={g.alt} className={g.tall ? "aspect-[4/5] w-full" : "aspect-[16/10] w-full"} />
                <figcaption className="mt-4 flex items-baseline gap-3">
                  <span className="label">{g.kicker}</span>
                  <span className="text-sm text-ash">{g.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    // altura definitiva é medida em JS; min-h-screen segura o layout até lá
    <div ref={root} className="relative min-h-screen">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-10 lg:px-16">
          <div className="mx-auto max-w-[1280px]">{header}</div>
        </div>

        <div className="g-track mt-12 flex w-max items-end gap-6 pl-6 pr-[20vw] md:gap-10 md:pl-10 lg:pl-16">
          {GALLERY.map((g) => (
            <figure
              key={g.kicker}
              className="group shrink-0"
              data-cursor="VER"
              style={{ width: g.tall ? "clamp(240px,26vw,380px)" : "clamp(320px,42vw,620px)" }}
            >
              <Plate
                src={g.src}
                alt={g.alt}
                desaturate
                className={g.tall ? "aspect-[4/5] w-full" : "aspect-[16/10] w-full"}
              />
              <figcaption className="mt-4 flex items-baseline gap-3">
                <span className="label">{g.kicker}</span>
                <span className="h-px w-6 bg-line" aria-hidden />
                <span className="text-sm text-ash transition-colors duration-500 group-hover:text-bone">
                  {g.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
