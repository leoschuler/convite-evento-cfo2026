"use client";

import { useMemo, useState } from "react";
import { EVENT, INVITE_DEFAULTS, RELATIONSHIP_LOGOS, TIERS } from "@/lib/event";
import { brl, inviteCode, maskPhone, onlyDigits, slugify } from "@/lib/format";
import type { Invitation, InviteStatus, InviteTier } from "@/lib/types";

const TIER_KEYS = Object.keys(TIERS) as InviteTier[];
const STATUSES: InviteStatus[] = ["AVAILABLE", "ACCEPTED", "EXPIRED", "CANCELLED"];
const BRANDS = ["", ...Object.keys(RELATIONSHIP_LOGOS)];

const blank = (): Invitation => ({
  invite_slug: "",
  guest_id: "",
  guest_name: "",
  guest_first_name: "",
  guest_position: null,
  guest_gender: "M",
  guest_photo: null,
  guest_whatsapp: null,
  guest_email: null,
  company_name: "",
  company_gender: "F",
  company_logo: null,
  relationship_brand: null,
  relationship_since: null,
  account_executive_name: null,
  invitation_reason: null,
  invite_tier: "MESA",
  invite_commercial_value: TIERS.MESA.value,
  invite_expiration: INVITE_DEFAULTS.invite_expiration,
  invite_status: "AVAILABLE",
  event_date: INVITE_DEFAULTS.event_date,
  event_location: INVITE_DEFAULTS.event_location,
  concierge_name: INVITE_DEFAULTS.concierge_name,
  concierge_whatsapp: INVITE_DEFAULTS.concierge_whatsapp,
  erick_video_url: null,
  erick_photo: null,
});

const BATCH_ERRORS: Record<string, string> = {
  guest_name_required: "nome do convidado é obrigatório",
  company_name_required: "nome da empresa é obrigatório",
  invalid_tier: "categoria inválida",
  invalid_status: "status inválido",
  invalid_slug: "não foi possível gerar um link (slug) válido",
  invalid_item: "item inválido — precisa ser um objeto",
  slug_duplicated_in_batch: "link (slug) repetido dentro do próprio lote",
  slug_taken: "já existe um convite com esse link (slug)",
};

function batchErrorMessage(body: { error?: string; index?: number }): string {
  if (body.error === "empty_batch") return "O array está vazio.";
  if (body.error === "batch_too_large") return "Lote grande demais (máximo 1000 convites por vez).";
  if (body.error === "try_again") return "Não foi possível salvar agora. Tente novamente em instantes.";
  const reason = body.error ? (BATCH_ERRORS[body.error] ?? body.error) : "erro desconhecido";
  return typeof body.index === "number" ? `Item ${body.index + 1}: ${reason}.` : `Não foi possível importar (${reason}).`;
}

export default function AdminPanel({ initial }: { initial: Invitation[] }) {
  const [invites, setInvites] = useState(initial);
  const [draft, setDraft] = useState<Invitation | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InviteStatus | "">("");
  const [tierFilter, setTierFilter] = useState<InviteTier | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invites.filter((i) => {
      if (statusFilter && i.invite_status !== statusFilter) return false;
      if (tierFilter && i.invite_tier !== tierFilter) return false;
      if (!q) return true;
      return [i.guest_name, i.company_name, i.invite_slug, i.guest_id].join(" ").toLowerCase().includes(q);
    });
  }, [invites, query, statusFilter, tierFilter]);

  const reload = async () => {
    const res = await fetch("/api/admin/invites");
    if (res.ok) setInvites((await res.json()).invites);
  };

  const save = async ({ guestPhoto, companyLogo }: InviteImages) => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("invite", JSON.stringify({ ...draft, originalSlug }));
    if (guestPhoto) form.set("guest_photo", guestPhoto);
    if (companyLogo) form.set("company_logo", companyLogo);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      body: form,
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(
        body.error === "slug_taken"
          ? "Já existe um convite com esse link."
          : body.error === "invalid_image"
            ? "Use uma imagem JPG, PNG ou WebP de até 5 MB."
          : `Não foi possível salvar (${body.error ?? res.status}).`,
      );
      return;
    }
    setDraft(null);
    setOriginalSlug(undefined);
    await reload();
  };

  const remove = async (slug: string) => {
    if (!confirm(`Excluir o convite ${slug}? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/admin/invites?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    await reload();
  };

  const inviteUrl = (slug: string) =>
    typeof window === "undefined" ? `/guest/${slug}` : `${window.location.origin}/guest/${slug}`;

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(inviteUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(null), 1800);
  };

  const whatsappHref = (i: Invitation) => {
    const digits = onlyDigits(i.guest_whatsapp ?? "");
    if (digits.length < 10) return null;
    const intl = digits.startsWith("55") ? digits : `55${digits}`;
    const text = `Olá, ${i.guest_first_name}! Aqui é do time do ${EVENT.ceo}.

Ele reservou pessoalmente um lugar para você no ${EVENT.name} ${EVENT.edition} — ${EVENT.dateShort}, ${EVENT.venue}.

Seu convite é individual e intransferível:
${inviteUrl(i.invite_slug)}`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  const startNew = () => {
    setDraft(blank());
    setOriginalSlug(undefined);
    setError(null);
  };

  const exportFiltered = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBatch = async (items: unknown[]) => {
    const res = await fetch("/api/admin/invites/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(batchErrorMessage(body));
    setBatchOpen(false);
    setBatchNotice(`${body.created?.length ?? 0} convite(s) importado(s).`);
    setTimeout(() => setBatchNotice(null), 4000);
    await reload();
  };

  const startEdit = (i: Invitation) => {
    setDraft({ ...i });
    setOriginalSlug(i.invite_slug);
    setError(null);
  };

  return (
    <main className="min-h-[100svh] bg-night px-5 py-8 md:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[0.66rem] uppercase tracking-[0.34em] text-frost">CFO Insights</div>
          <div className="label mt-2">Painel interno — convites</div>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nome, empresa ou link"
            className="w-56 border-b border-edge bg-transparent pb-2 text-sm text-frost outline-none placeholder:text-dim focus:border-cyan"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InviteStatus | "")}
            className="border-b border-edge bg-transparent pb-2 text-sm text-frost outline-none focus:border-cyan"
          >
            <option value="" className="bg-slate text-frost">
              Todos os status
            </option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-slate text-frost">
                {s}
              </option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as InviteTier | "")}
            className="border-b border-edge bg-transparent pb-2 text-sm text-frost outline-none focus:border-cyan"
          >
            <option value="" className="bg-slate text-frost">
              Todas as categorias
            </option>
            {TIER_KEYS.map((t) => (
              <option key={t} value={t} className="bg-slate text-frost">
                {TIERS[t].label}
              </option>
            ))}
          </select>
          <button
            onClick={startNew}
            className="border border-cyan/40 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-frost transition-colors hover:border-cyan"
          >
            + Novo convite
          </button>
          <button
            onClick={() => setBatchOpen(true)}
            className="border border-edge px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-frost transition-colors hover:border-cyan"
          >
            Importar em lote
          </button>
          <button
            onClick={exportFiltered}
            disabled={!filtered.length}
            className="border border-edge px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-frost transition-colors hover:border-cyan disabled:opacity-40"
          >
            Exportar
          </button>
          <button
            onClick={async () => {
              await fetch("/api/admin/login", { method: "DELETE" });
              location.reload();
            }}
            className="label transition-colors hover:text-frost"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-6">
        <Stat label="Total" value={String(invites.length)} />
        <Stat label="Disponíveis" value={String(invites.filter((i) => i.invite_status === "AVAILABLE").length)} />
        <Stat label="Aceitos" value={String(invites.filter((i) => i.invite_status === "ACCEPTED").length)} />
        <span className="label">
          {filtered.length === invites.length
            ? `${filtered.length} convite(s) listado(s)`
            : `${filtered.length} de ${invites.length} convite(s) listado(s)`}
        </span>
        {batchNotice && <span className="label text-cyan">{batchNotice}</span>}
      </div>

      <div className="overflow-x-auto border border-edge">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-edge">
              {["Convidado", "Empresa", "Categoria", "Status", "Link", "Ações"].map((h) => (
                <th key={h} className="label px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const wa = whatsappHref(i);
              return (
                <tr key={i.invite_slug} className="border-b border-edge/60 align-middle hover:bg-slate/50">
                  <td className="px-4 py-4">
                    <div className="text-frost">{i.guest_name}</div>
                    <div className="label mt-1">
                      {inviteCode(i.guest_id)}
                      {i.guest_position ? ` · ${i.guest_position}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-frost/75">{i.company_name}</td>
                  <td className="px-4 py-4">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">
                      {TIERS[i.invite_tier].label}
                    </div>
                    <div className="label mt-1">{brl(TIERS[i.invite_tier].value)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-frost/70">
                      {i.invite_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-[0.72rem] text-frost/60">/guest/{i.invite_slug}</code>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Action onClick={() => copy(i.invite_slug)}>
                        {copied === i.invite_slug ? "copiado!" : "copiar link"}
                      </Action>
                      <a
                        href={`/guest/${i.invite_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="label transition-colors hover:text-frost"
                      >
                        abrir
                      </a>
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cyan transition-opacity hover:opacity-70"
                        >
                          whatsapp
                        </a>
                      ) : (
                        <span className="label opacity-40" title="Cadastre o WhatsApp do convidado">
                          whatsapp
                        </span>
                      )}
                      <Action onClick={() => startEdit(i)}>editar</Action>
                      <Action onClick={() => remove(i.invite_slug)} danger>
                        excluir
                      </Action>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <span className="label">Nenhum convite encontrado</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <Editor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={() => {
            setDraft(null);
            setOriginalSlug(undefined);
          }}
          busy={busy}
          error={error}
          isNew={!originalSlug}
        />
      )}

      {batchOpen && <BatchImport onImport={importBatch} onCancel={() => setBatchOpen(false)} />}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[1.6rem] leading-none tracking-[-0.03em] text-frost">{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

function Action({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors ${
        danger ? "text-dim hover:text-ember" : "text-dim hover:text-frost"
      }`}
    >
      {children}
    </button>
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
  busy,
  error,
  isNew,
}: {
  draft: Invitation;
  setDraft: (i: Invitation) => void;
  onSave: (images: InviteImages) => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
  isNew: boolean;
}) {
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const set = <K extends keyof Invitation>(k: K, v: Invitation[K]) => setDraft({ ...draft, [k]: v });

  const suggestSlug = () =>
    slugify(`${draft.guest_name} ${draft.company_name.split(/\s+/)[0] ?? ""}`.trim());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night/90 px-4 py-10 backdrop-blur-xl md:px-8">
      <div className="mx-auto w-full max-w-[900px] border border-edge bg-slate p-6 md:p-9">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="text-[1.3rem] tracking-[-0.02em] text-frost">
            {isNew ? "Novo convite" : `Editar — ${draft.guest_name}`}
          </h2>
          <button onClick={onCancel} className="label transition-colors hover:text-frost">
            fechar
          </button>
        </div>

        <Group title="Convidado">
          <F label="Nome completo" value={draft.guest_name} onChange={(v) => set("guest_name", v)} required />
          <F
            label="Primeiro nome"
            value={draft.guest_first_name}
            onChange={(v) => set("guest_first_name", v)}
            placeholder={draft.guest_name.split(/\s+/)[0] ?? ""}
          />
          <F label="Cargo" value={draft.guest_position ?? ""} onChange={(v) => set("guest_position", v || null)} />
          <S
            label="Tratamento"
            value={draft.guest_gender}
            onChange={(v) => set("guest_gender", v as "M" | "F")}
            options={[
              ["M", "Masculino — convidado, bem-vindo"],
              ["F", "Feminino — convidada, bem-vinda"],
            ]}
          />
          <F
            label="WhatsApp (para receber o link)"
            value={draft.guest_whatsapp ?? ""}
            onChange={(v) => set("guest_whatsapp", maskPhone(v) || null)}
            placeholder="(11) 90000-0000"
          />
          <F label="E-mail" value={draft.guest_email ?? ""} onChange={(v) => set("guest_email", v || null)} />
          <ImageUpload
            label="Foto do convidado"
            current={draft.guest_photo}
            file={guestPhoto}
            onChange={setGuestPhoto}
            hint="Aparece ao lado da foto do Erick na abertura"
          />
        </Group>

        <Group title="Empresa">
          <F label="Nome da empresa" value={draft.company_name} onChange={(v) => set("company_name", v)} required />
          <S
            label="Artigo da empresa"
            value={draft.company_gender}
            onChange={(v) => set("company_gender", v as "M" | "F")}
            options={[
              ["F", "Feminino — da XPTO Alimentos"],
              ["M", "Masculino — do Grupo Pomin"],
            ]}
          />
          <ImageUpload
            label="Logo da empresa"
            current={draft.company_logo}
            file={companyLogo}
            onChange={setCompanyLogo}
            hint="Aparece no rodapé da abertura"
          />
        </Group>

        <Group title="Relacionamento">
          <S
            label="Empresa de vínculo"
            value={draft.relationship_brand ?? ""}
            onChange={(v) => set("relationship_brand", (v || null) as Invitation["relationship_brand"])}
            options={BRANDS.map((b) => [b, b || "—"] as [string, string])}
            hint="O logo escolhido aparece entre Erick e o convidado na abertura."
          />
          <F
            label="Cliente desde"
            value={draft.relationship_since ?? ""}
            onChange={(v) => set("relationship_since", v || null)}
            placeholder="2021"
          />
          <F
            label="Executivo de conta"
            value={draft.account_executive_name ?? ""}
            onChange={(v) => set("account_executive_name", v || null)}
          />
        </Group>

        <Group title="Convite">
          <F
            label="Link (slug)"
            value={draft.invite_slug}
            onChange={(v) => set("invite_slug", slugify(v))}
            placeholder={suggestSlug()}
            hint={`/guest/${draft.invite_slug || suggestSlug() || "..."}`}
            action={{ label: "gerar", onClick: () => set("invite_slug", suggestSlug()) }}
          />
          <S
            label="Categoria"
            value={draft.invite_tier}
            onChange={(v) => {
              const tier = v as InviteTier;
              setDraft({ ...draft, invite_tier: tier, invite_commercial_value: TIERS[tier].value });
            }}
            options={TIER_KEYS.map((t) => [t, `${TIERS[t].label} — ${brl(TIERS[t].value)}`] as [string, string])}
          />
          <S
            label="Status"
            value={draft.invite_status}
            onChange={(v) => set("invite_status", v as InviteStatus)}
            options={STATUSES.map((s) => [s, s] as [string, string])}
          />
        </Group>

        {error && <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember">{error}</p>}

        <div className="flex items-center gap-5">
          <button
            onClick={() => onSave({ guestPhoto, companyLogo })}
            disabled={busy || !draft.guest_name || !draft.company_name}
            className="border border-cyan/40 px-8 py-3.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-frost transition-colors hover:border-cyan disabled:opacity-40"
          >
            {busy ? "Salvando…" : "Salvar convite"}
          </button>
          <button onClick={onCancel} className="label transition-colors hover:text-frost">
            cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const BATCH_PLACEHOLDER = `[
  {
    "guest_name": "Maria Silva",
    "company_name": "Empresa X",
    "guest_email": "maria@empresax.com",
    "guest_whatsapp": "11999999999",
    "invite_tier": "MESA"
  }
]`;

function BatchImport({
  onImport,
  onCancel,
}: {
  onImport: (items: unknown[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("JSON inválido — confira vírgulas e chaves.");
      return;
    }
    if (!Array.isArray(parsed) || !parsed.length) {
      setError("Cole um array com pelo menos um convite.");
      return;
    }

    setBusy(true);
    try {
      await onImport(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível importar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night/90 px-4 py-10 backdrop-blur-xl md:px-8">
      <div className="mx-auto w-full max-w-[760px] border border-edge bg-slate p-6 md:p-9">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-[1.3rem] tracking-[-0.02em] text-frost">Importar convites em lote</h2>
          <button onClick={onCancel} className="label transition-colors hover:text-frost">
            fechar
          </button>
        </div>

        <p className="label mb-4 leading-[1.8] opacity-80">
          Cole um array JSON de convites. Só <code>guest_name</code> e <code>company_name</code> são
          obrigatórios — o resto usa os mesmos padrões do formulário individual (slug gerado a partir do
          nome, categoria MESA, etc). <code>guest_id</code> é sempre gerado pelo servidor; se vier no JSON,
          é ignorado.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={BATCH_PLACEHOLDER}
          spellCheck={false}
          rows={16}
          className="w-full resize-y border border-edge bg-transparent p-3 font-mono text-[0.78rem] leading-relaxed text-frost outline-none placeholder:text-dim/70 focus:border-cyan"
        />

        {error && <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember">{error}</p>}

        <div className="mt-6 flex items-center gap-5">
          <button
            onClick={submit}
            disabled={busy || !text.trim()}
            className="border border-cyan/40 px-8 py-3.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-frost transition-colors hover:border-cyan disabled:opacity-40"
          >
            {busy ? "Importando…" : "Importar"}
          </button>
          <button onClick={onCancel} className="label transition-colors hover:text-frost">
            cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

type InviteImages = {
  guestPhoto: File | null;
  companyLogo: File | null;
};

function ImageUpload({
  label,
  current,
  file,
  onChange,
  hint,
}: {
  label: string;
  current: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  hint: string;
}) {
  return (
    <div>
      <label className="label mb-2 block">{label}</label>
      <label className="flex cursor-pointer items-center justify-between gap-4 border border-edge px-3 py-3 transition-colors hover:border-cyan">
        <span className="truncate text-[0.85rem] text-frost/70">
          {file?.name ?? (current ? "Imagem cadastrada" : "Selecionar imagem")}
        </span>
        <span className="label shrink-0 text-cyan">{current || file ? "trocar" : "upload"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      <p className="label mt-2 opacity-70">{hint} · JPG, PNG ou WebP, até 5 MB</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <div className="label mb-5 border-b border-edge pb-3">{title}</div>
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">{children}</div>
    </section>
  );
}

function F({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
  action,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="label">
          {label}
          {required && <span className="ml-1 text-ember">*</span>}
        </label>
        {action && (
          <button type="button" onClick={action.onClick} className="label transition-colors hover:text-cyan">
            {action.label}
          </button>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-edge bg-transparent pb-2 text-[0.95rem] text-frost outline-none transition-colors placeholder:text-dim focus:border-cyan"
      />
      {hint && <p className="label mt-2 truncate opacity-70">{hint}</p>}
    </div>
  );
}

function S({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  hint?: string;
}) {
  return (
    <div>
      <label className="label mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-edge bg-transparent pb-2 text-[0.95rem] text-frost outline-none transition-colors focus:border-cyan"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-slate text-frost">
            {l}
          </option>
        ))}
      </select>
      {hint && <p className="label mt-2 opacity-70">{hint}</p>}
    </div>
  );
}
