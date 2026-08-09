"use client";

import { useState } from "react";
import { isValidPhone, maskPhone } from "@/lib/format";
import type { AcceptPayload } from "@/lib/types";
import { useInvite } from "./InviteProvider";

type Errors = Partial<Record<keyof AcceptPayload, string>>;

/**
 * Só aparece depois do aceite. Nome e empresa já vêm preenchidos —
 * o convidado não deve ter que se apresentar para quem já o convidou.
 */
export default function InviteForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (payload: AcceptPayload) => void;
}) {
  const { invitation } = useInvite();

  const [values, setValues] = useState<AcceptPayload>({
    guest_name: invitation.guest_name,
    guest_position: invitation.guest_position ?? "",
    company_name: invitation.company_name,
    email: invitation.guest_email ?? "",
    whatsapp: invitation.guest_whatsapp ? maskPhone(invitation.guest_whatsapp) : "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = (k: keyof AcceptPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  // Máscara aplicada a cada tecla: (11) 94234-3927. Impede número torto.
  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, whatsapp: maskPhone(e.target.value) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.guest_name.trim()) next.guest_name = "Obrigatório";
    if (!values.company_name.trim()) next.company_name = "Obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = "E-mail inválido";
    if (!isValidPhone(values.whatsapp)) next.whatsapp = "Informe DDD + número";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ ...values, email: values.email.trim(), whatsapp: values.whatsapp.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        <Field label="Nome" value={values.guest_name} onChange={set("guest_name")} error={errors.guest_name} />
        <Field
          label="Empresa"
          value={values.company_name}
          onChange={set("company_name")}
          error={errors.company_name}
        />
        <Field
          label="Cargo"
          value={values.guest_position}
          onChange={set("guest_position")}
          error={errors.guest_position}
          optional
        />
        <Field
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Field
          label="WhatsApp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(11) 90000-0000"
          maxLength={15}
          value={values.whatsapp}
          onChange={setPhone}
          error={errors.whatsapp}
        />
      </div>

      <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={submitting}
          data-cursor="CONFIRMAR"
          className="group relative overflow-hidden border border-bone/40 px-9 py-4 transition-colors duration-500 hover:border-bone disabled:opacity-50"
        >
          <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
          <span className="relative font-mono text-[0.66rem] uppercase tracking-[0.28em] text-bone transition-colors duration-500 group-hover:text-void">
            {submitting ? "Confirmando…" : "Confirmar presença"}
          </span>
        </button>
        <span className="label max-w-[34ch] leading-[1.7]">
          Usamos estes dados apenas para cuidar da sua experiência no evento.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  optional,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; optional?: boolean }) {
  const id = `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className="relative">
      <label htmlFor={id} className="label mb-3 block">
        {label}
        {optional && <span className="ml-2 text-dim/70">opcional</span>}
      </label>
      <input
        id={id}
        {...props}
        aria-invalid={!!error}
        className="w-full border-b border-line bg-transparent pb-3 text-[1.02rem] text-bone outline-none transition-colors duration-300 placeholder:text-dim/60 focus:border-platinum"
      />
      {error && <span className="mt-2 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember">{error}</span>}
    </div>
  );
}
