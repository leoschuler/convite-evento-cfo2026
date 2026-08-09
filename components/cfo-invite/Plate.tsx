"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

type Scrim = "none" | "bottom" | "full" | "left" | "top";

type Props = {
  src: string;
  alt: string;
  /** Container. Precisa definir a altura (aspect-*, h-*, inset-0…). */
  className?: string;
  /** Deslocamento vertical no scroll, em % da altura da imagem. 0 desliga. */
  parallax?: number;
  /** Escala de entrada (ken burns) — 1.12 entra grande e assenta. */
  zoomFrom?: number;
  /** Hero: carrega imediato e com prioridade. */
  priority?: boolean;
  scrim?: Scrim;
  /** Dessatura; volta a cor no hover do grupo pai (`group`). */
  desaturate?: boolean;
  children?: React.ReactNode;
};

const SCRIMS: Record<Scrim, string> = {
  none: "",
  bottom: "bg-gradient-to-t from-void via-void/55 to-transparent",
  top: "bg-gradient-to-b from-void/85 via-void/25 to-transparent",
  full: "bg-void/55",
  left: "bg-gradient-to-r from-void via-void/60 to-transparent",
};

/**
 * Único ponto de contato com imagem na v2.
 * Trocar <img> por next/image quando as fotos reais chegarem é uma edição só aqui.
 */
export default function Plate({
  src,
  alt,
  className = "",
  parallax = 0,
  zoomFrom,
  priority = false,
  scrim = "none",
  desaturate = false,
  children,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();

  // Imagem em cache resolve antes da hidratação e nunca dispara onLoad.
  useEffect(() => {
    if (img.current?.complete) setLoaded(true);
  }, []);

  useGSAP(
    () => {
      if (reduced || !root.current || !img.current) return;

      if (parallax > 0) {
        gsap.fromTo(
          img.current,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5 },
          },
        );
      }

      if (zoomFrom) {
        gsap.fromTo(
          img.current,
          { scale: zoomFrom },
          {
            scale: 1,
            duration: 2.4,
            ease: "expo.out",
            scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
          },
        );
      }
    },
    { scope: root, dependencies: [reduced, parallax, zoomFrom] },
  );

  // Com parallax a imagem precisa sobrar, senão aparece borda ao deslocar.
  const bleed = parallax > 0 ? { top: `-${parallax * 1.4}%`, height: `${100 + parallax * 2.8}%` } : undefined;

  return (
    <div ref={root} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={bleed}
        className={`absolute inset-x-0 top-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        } ${desaturate ? "grayscale-[0.65] transition-[filter,opacity] group-hover:grayscale-0" : ""}`}
      />

      {scrim !== "none" && <div className={`absolute inset-0 ${SCRIMS[scrim]}`} aria-hidden />}
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      {children}
    </div>
  );
}
