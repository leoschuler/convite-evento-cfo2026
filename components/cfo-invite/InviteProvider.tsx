"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { inviteContext, track, type InviteEvent } from "@/lib/analytics";
import { TIERS } from "@/lib/event";
import type { AcceptPayload, Invitation, InviteStatus } from "@/lib/types";

type Ctx = {
  invitation: Invitation;
  status: InviteStatus;
  entered: boolean;
  enter: () => void;
  markAccepted: (payload: AcceptPayload) => void;
  ev: (event: InviteEvent, params?: Record<string, string | number | boolean | null | undefined>) => void;
  isVip: boolean;
  tierLabel: string;
  /** Incrementa quando algo fora da seção de CTA pede para abrir o aceite. */
  acceptSignal: number;
  requestAccept: () => void;
  /** true enquanto o formulário de aceite (ou o envio) está em tela. */
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
};

const InviteCtx = createContext<Ctx | null>(null);

export function InviteProvider({
  invitation,
  children,
}: {
  invitation: Invitation;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<InviteStatus>(invitation.invite_status);
  const [entered, setEntered] = useState(false);
  const [acceptSignal, setAcceptSignal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const context = useMemo(() => inviteContext(invitation), [invitation]);

  const ev: Ctx["ev"] = useCallback((event, params) => track(event, context, params), [context]);

  const enter = useCallback(() => {
    setEntered(true);
    document.body.dataset.locked = "false";
    ev("invite_experience_started");
  }, [ev]);

  const markAccepted = useCallback(() => {
    setStatus("ACCEPTED");
    ev("invite_accepted");
  }, [ev]);

  const requestAccept = useCallback(() => setAcceptSignal((n) => n + 1), []);

  const value = useMemo<Ctx>(
    () => ({
      invitation,
      status,
      entered,
      enter,
      markAccepted,
      ev,
      isVip: invitation.invite_tier === "CAMAROTE",
      tierLabel: TIERS[invitation.invite_tier].label,
      acceptSignal,
      requestAccept,
      formOpen,
      setFormOpen,
    }),
    [invitation, status, entered, enter, markAccepted, ev, acceptSignal, requestAccept, formOpen],
  );

  return <InviteCtx.Provider value={value}>{children}</InviteCtx.Provider>;
}

export function useInvite() {
  const ctx = useContext(InviteCtx);
  if (!ctx) throw new Error("useInvite fora do InviteProvider");
  return ctx;
}
