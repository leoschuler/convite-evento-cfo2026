"use client";

import { useEffect, useState } from "react";
import { useInvite } from "./InviteProvider";

export default function InviteHeader() {
  const { invitation, entered, status } = useInvite();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[110] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        entered ? "opacity-100" : "pointer-events-none opacity-0"
      } ${compact ? "py-3 backdrop-blur-xl" : "py-6"}`}
      style={{
        backgroundColor: compact ? "rgba(5,5,6,0.62)" : "transparent",
        borderBottom: compact ? "1px solid rgba(43,46,53,0.7)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-16">
        <div className="flex items-baseline gap-3">
          <span
            className={`font-mono uppercase tracking-[0.3em] text-bone transition-all duration-700 ${
              compact ? "text-[0.6rem]" : "text-[0.68rem]"
            }`}
          >
            CFO Insights
          </span>
          <span className="hidden h-3 w-px bg-line md:block" aria-hidden />
          <span className="label hidden md:block">Private Invitation</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-1 w-1 rounded-full ${status === "ACCEPTED" ? "bg-platinum" : "bg-ember"}`}
            style={{ animation: "pulse-dot 3.2s ease-in-out infinite" }}
            aria-hidden
          />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/80">
            {invitation.guest_first_name}
          </span>
        </div>
      </div>
    </header>
  );
}
