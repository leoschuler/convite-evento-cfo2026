"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) location.reload();
    else setError(res.status === 401 ? "Senha incorreta." : "Painel não configurado.");
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-night px-6">
      <form onSubmit={submit} className="w-full max-w-[340px]">
        <div className="font-mono text-[0.66rem] uppercase tracking-[0.34em] text-frost">CFO Insights</div>
        <div className="label mt-3">Painel interno</div>

        <label htmlFor="pw" className="label mt-12 block">
          Senha
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-3 w-full border-b border-edge bg-transparent pb-3 text-[1.02rem] text-frost outline-none transition-colors focus:border-cyan"
        />

        {error && <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-9 w-full border border-cyan/40 py-3.5 font-mono text-[0.64rem] uppercase tracking-[0.24em] text-frost transition-colors hover:border-cyan disabled:opacity-40"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
