import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cfo_admin";

/** Senha do painel. Defina ADMIN_PASSWORD no ambiente. */
const password = () => process.env.ADMIN_PASSWORD ?? "";

/** O cookie guarda o hash, nunca a senha. */
const tokenFor = (pw: string) => createHash("sha256").update(`cfo-insights::${pw}`).digest("hex");

export function isConfigured() {
  return password().length >= 8;
}

export function checkPassword(candidate: string) {
  const expected = Buffer.from(tokenFor(password()));
  const given = Buffer.from(tokenFor(candidate));
  // Comparação em tempo constante: senha curta não deve vazar por timing.
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function sessionToken() {
  return tokenFor(password());
}

export async function isAuthenticated() {
  if (!isConfigured()) return false;
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expected = Buffer.from(sessionToken());
  const given = Buffer.from(value);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
