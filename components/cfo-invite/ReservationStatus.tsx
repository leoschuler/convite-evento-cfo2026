"use client";

import { useEffect, useState } from "react";
import { useInvite } from "./InviteProvider";
import { Reveal } from "./primitives";

const TICKS = 36;

/** Escassez sem urgência de e-commerce: uma reserva com prazo, dita em voz baixa. */
export default function ReservationStatus() {
  const { invitation, status } = useInvite();
  const expiration = invitation.invite_expiration;

  // Calculado no cliente: depende de "hoje" e não pode divergir do HTML do servidor.
  const [lit, setLit] = useState(Math.round(TICKS * 0.5));
  useEffect(() => {
    if (expiration) setLit(litTicks(expiration));
  }, [expiration]);

  if (status === "ACCEPTED" || !expiration) return null;

  return (
    <Reveal className="py-[12vh]">
      <div className="edge bg-charcoal/30 px-7 py-10 backdrop-blur-sm md:px-12 md:py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div data-reveal>
            <div className="label mb-5">Reserva</div>
            <p className="text-[clamp(1.35rem,3vw,2.1rem)] leading-[1.2] tracking-[-0.02em] text-bone">
              Seu convite está reservado até{" "}
              <span className="serif-accent text-platinum">{expiration}</span>
            </p>
            <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-dim">
              Após esta data, o acesso poderá ser disponibilizado para outro convidado.
            </p>
          </div>

          <div className="flex items-end gap-[3px]" data-reveal aria-hidden>
            {Array.from({ length: TICKS }, (_, i) => (
              <span
                key={i}
                className="w-px transition-colors duration-700"
                style={{
                  height: i % 6 === 0 ? 26 : 16,
                  background: i < lit ? "rgba(216,210,198,0.75)" : "rgba(91,94,102,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** dd/mm/aaaa → quantos ticks acesos numa janela de 30 dias. */
function litTicks(expiration: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(expiration.trim());
  if (!m) return Math.round(TICKS * 0.5);
  const end = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const days = (end.getTime() - Date.now()) / 86_400_000;
  const ratio = Math.max(0.08, Math.min(1, days / 30));
  return Math.round(TICKS * ratio);
}
