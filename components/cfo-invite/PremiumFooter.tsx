"use client";

import { EVENT,  TIERS } from "@/lib/event";
import { docHash, inviteCode } from "@/lib/format";
import { useInvite } from "./InviteProvider";

export default function PremiumFooter() {
  const { invitation, tierLabel, status } = useInvite();

  return (
    <footer className="relative border-t border-line/60 px-6 pb-12 pt-16 md:px-10 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.36em] text-bone">CFO Insights</div>
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-dim">{EVENT.tagline}</p>
        </div>

        <div className="grid gap-2.5">
          <FootRow k="Private invitation" v={invitation.guest_name} />
          <FootRow k="Issued to" v={invitation.company_name} />
          <FootRow k="Guest" v={inviteCode(invitation.guest_id)} />
          <FootRow k="Authorized by" v={EVENT.ceo} />
          <FootRow k="Access" v={tierLabel + " | " + TIERS[invitation.invite_tier].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + " Discount"} />
          <FootRow k="Status" v={status === "ACCEPTED" ? "Confirmed" : "Reserved"} />
          <FootRow k="Doc" v={docHash(invitation.invite_slug, 12)} />
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-line/50 pt-8 md:flex-row md:items-center md:justify-between">
        <span className="label">Convite gerado exclusivamente para {invitation.company_name}</span>
        <span className="label">
          {EVENT.host} — {EVENT.ceo}
        </span>
      </div>
    </footer>
  );
}

function FootRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="label whitespace-nowrap">{k}</span>
      <span className="h-px flex-1 bg-line/60" aria-hidden />
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bone/70">{v}</span>
    </div>
  );
}
