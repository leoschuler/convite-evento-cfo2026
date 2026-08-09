"use client";

import { useEffect, useRef } from "react";
import type { InviteEvent } from "@/lib/analytics";
import { useInvite } from "./InviteProvider";

const MARKS = [25, 50, 75, 100] as const;

/** Fio de progresso no topo + disparo dos eventos de profundidade de scroll. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const { ev, entered } = useInvite();
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!entered) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;

      const pct = Math.round(p * 100);
      for (const m of MARKS) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          ev(`invite_scroll_${m}` as InviteEvent);
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ev, entered]);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[120] h-px w-full bg-transparent" aria-hidden>
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-platinum/70 to-platinum"
      />
    </div>
  );
}
