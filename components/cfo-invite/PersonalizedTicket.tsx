"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { docHash, inviteCode } from "@/lib/format";
import { EVENT, TIERS } from "@/lib/event";
import { useInvite } from "./InviteProvider";

type Props = {
  /** RESERVED → CONFIRMED muda o acabamento do cartão. */
  confirmed?: boolean;
  /** "AUTORIZANDO..." durante o aceite. */
  authorizing?: boolean;
  className?: string;
};

/**
 * Credencial pessoal. Boarding pass executivo, não ingresso de evento.
 * Luz responde ao ponteiro; em toque, a luz percorre sozinha.
 */
export default function PersonalizedTicket({ confirmed = false, authorizing = false, className = "" }: Props) {
  const { invitation, tierLabel } = useInvite();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const rx = useSpring(rxRaw, { stiffness: 140, damping: 18, mass: 0.4 });
  const ry = useSpring(ryRaw, { stiffness: 140, damping: 18, mass: 0.4 });

  const sheen = useMotionTemplate`radial-gradient(340px circle at ${px}% ${py}%, rgba(255,255,255,0.10), transparent 62%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx * 100);
    py.set(ny * 100);
    ryRaw.set((nx - 0.5) * 9);
    rxRaw.set(-(ny - 0.5) * 9);
  };

  const reset = () => {
    ryRaw.set(0);
    rxRaw.set(0);
    px.set(50);
    py.set(50);
  };

  const status = confirmed ? "CONFIRMED" : authorizing ? "AUTHORIZING…" : "RESERVED";

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      data-cursor="CREDENCIAL"
      className={`relative isolate w-full select-none ${className}`}
    >
      {/* borda metálica */}
      <div
        className={`absolute -inset-px rounded-[3px] transition-opacity duration-1000 ${
          confirmed ? "opacity-100" : "opacity-60"
        }`}
        style={{
          background: confirmed
            ? "linear-gradient(140deg,#6a6c71,#e8e3d9 22%,#ffffff 34%,#8a8c92 55%,#d8d2c6 78%,#5c5e64)"
            : "linear-gradient(140deg,#2b2e35,#5b5e66 40%,#2b2e35 70%,#41444b)",
        }}
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[2px] bg-[#0d0e11]">
        <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ background: sheen }} aria-hidden />
        <div className="grain pointer-events-none absolute inset-0 z-10" aria-hidden />
        {confirmed && (
          <div
            className="animate-sheen pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(100deg,transparent 35%,rgba(255,255,255,0.07) 48%,rgba(255,255,255,0.14) 50%,transparent 65%)",
              backgroundSize: "200% 100%",
            }}
            aria-hidden
          />
        )}

        <div className="relative z-20 p-6 md:p-7">
          {/* topo */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.34em] text-bone">CFO Insights</div>
              <div className="label mt-2">Executive Guest</div>
            </div>
            <div className="text-right">
              <div
                className={`font-mono text-[0.58rem] uppercase tracking-[0.22em] ${
                  confirmed ? "metal-text" : "text-platinum/80"
                }`}
              >
                {tierLabel} | {TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <div className="label mt-2">{inviteCode(invitation.guest_id)}</div>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-line/70" />

          {/* identidade */}
          <div className="min-h-[104px]">
            <div className="label mb-3">Guest</div>
            <div className="text-[1.55rem] leading-[1.05] tracking-[-0.02em] text-bone md:text-[1.75rem]">
              {invitation.guest_name}
            </div>
            <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ash">
              {[invitation.guest_position, invitation.company_name].filter(Boolean).join(" · ")}
            </div>
          </div>

          <div className="my-6 h-px w-full bg-line/70" />

          {/* metadados */}
          <dl className="space-y-2.5">
            <Row k="Authorized by" v={EVENT.ceo.toUpperCase()} />
            <Row k="ACCESS" v={ TIERS[invitation.invite_tier].label + " | " + TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
            <Row k="Event" v={invitation.event_date} />
            <Row k="Venue" v={invitation.event_location} />
            <Row
              k="Status"
              v={status}
              accent={confirmed ? "confirmed" : authorizing ? "pending" : "reserved"}
            />
          </dl>

          {/* rodapé — leitura ótica decorativa */}
          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="flex h-7 items-end gap-[2px]" aria-hidden>
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className="w-[2px] bg-bone/25"
                  style={{ height: `${h}%`, opacity: confirmed ? 0.55 : 0.3 }}
                />
              ))}
            </div>
            <span className="label whitespace-nowrap">{docHash(invitation.invite_slug, 10)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: "confirmed" | "pending" | "reserved" }) {
  const color =
    accent === "confirmed"
      ? "text-platinum"
      : accent === "pending"
        ? "text-ember"
        : accent === "reserved"
          ? "text-bone/85"
          : "text-bone/85";
  return (
    <div className="flex items-baseline gap-3">
      <dt className="label whitespace-nowrap">{k}</dt>
      <span className="h-px flex-1 bg-line/60" aria-hidden />
      <dd className={`font-mono text-[0.6rem] uppercase tracking-[0.16em] ${color}`}>{v}</dd>
    </div>
  );
}

/** Padrão fixo — nada de aleatório, senão muda a cada render. */
const BARS = [100, 40, 72, 28, 90, 55, 34, 82, 46, 100, 30, 64, 88, 38, 70, 26, 94, 50, 76, 42, 100, 34, 60, 86];
