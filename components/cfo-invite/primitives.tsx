"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Revela filhos marcados com data-reveal quando a seção entra na viewport. */
export function Reveal({
  children,
  className,
  y = 26,
  delay = 0,
  stagger = 0.09,
  start = "top 84%",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    { scope: ref, dependencies: [] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Linha de texto que sobe de dentro de uma máscara. Uso: títulos grandes. */
export function MaskLine({
  children,
  className,
  delay = 0,
  start = "top 86%",
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  start?: string;
  as?: "span" | "div" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const inner = root.firstElementChild as HTMLElement | null;
      if (!inner) return;

      if (prefersReducedMotion()) {
        gsap.set(inner, { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.set(inner, { yPercent: 115, opacity: 1 });
      gsap.to(inner, {
        yPercent: 0,
        duration: 1.25,
        ease: "expo.out",
        delay,
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    { scope: ref, dependencies: [] },
  );

  return (
    // @ts-expect-error — ref polimórfico, todos os alvos são elementos HTML
    <Tag ref={ref} className={`line-mask ${className ?? ""}`}>
      <span>{children}</span>
    </Tag>
  );
}

/** Metadado de documento: LABEL / valor */
export function Marker({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="label whitespace-nowrap">{label}</span>
      <span className="h-px flex-1 bg-line/70" aria-hidden />
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-bone/85">{value}</span>
    </div>
  );
}

/** Numeração de capítulo. */
export function Chapter({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-14 flex items-center gap-4" data-reveal>
      <span className="label-bright">{n}</span>
      <span className="h-px w-10 bg-line" aria-hidden />
      <span className="label">{title}</span>
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative px-6 md:px-10 lg:px-16 ${className}`}>
      {children}
    </section>
  );
}
