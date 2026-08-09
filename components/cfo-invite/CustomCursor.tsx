"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Cursor discreto. Lê data-cursor="EXPLORE|PLAY|ACCEPT|..." do elemento sob o mouse.
 * Só existe em ponteiro fino — mobile nunca depende dele.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [on, setOn] = useState(false);

  // 1) decide se o cursor existe — só então os elementos são montados
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && !prefersReducedMotion()) setOn(true);
  }, []);

  // 2) com os elementos em tela, liga o tracking
  useEffect(() => {
    if (!on || !dot.current || !ring.current) return;

    document.body.dataset.cursorOn = "true";

    const xTo = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const yTo = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const xR = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const yR = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

    let current: string | null = null;

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xR(e.clientX);
      yR(e.clientY);

      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      const next = el?.dataset.cursor ?? null;
      if (next !== current) {
        current = next;
        setLabel(next);
      }
    };

    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      delete document.body.dataset.cursorOn;
    };
  }, [on]);

  useEffect(() => {
    if (!on) return;
    gsap.to(ring.current, {
      width: label ? 74 : 34,
      height: label ? 74 : 34,
      borderColor: label ? "rgba(237,234,227,0.55)" : "rgba(237,234,227,0.25)",
      duration: 0.5,
      ease: "expo.out",
    });
    gsap.to(dot.current, { scale: label ? 0 : 1, duration: 0.35, ease: "expo.out" });
  }, [label, on]);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden>
      <div
        ref={ring}
        className="absolute left-0 top-0 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/25 backdrop-blur-[1px]"
      >
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-bone/80">{label}</span>
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone"
      />
    </div>
  );
}
