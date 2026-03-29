/** UUID v4 (y variantes comunes) dentro de texto pegado desde correo o notas. */
const LOOSE_UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;

/**
 * El QR de invitación codifica la URL `/invite/{token}` o a veces solo el token.
 * También localiza un UUID si el usuario pegó frases extra (correo, WhatsApp, etc.).
 */
export function extractInviteTokenFromScan(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const u = new URL(trimmed);
    const m = u.pathname.match(/\/invite\/([^/]+)\/?$/i);
    if (m?.[1]) {
      return decodeURIComponent(m[1]);
    }
  } catch {
    /* no es URL absoluta */
  }

  if (trimmed.includes("/invite/")) {
    const m = trimmed.match(/\/invite\/([^/?#]+)/i);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }

  const uuidHit = trimmed.match(LOOSE_UUID_RE);
  if (uuidHit?.[0]) {
    return uuidHit[0];
  }

  return trimmed;
}

/** Indica si el token ya parseado tiene forma de UUID (validación visual en UI). */
export function isLikelyInviteUuid(token: string): boolean {
  return LOOSE_UUID_RE.test(token.trim());
}
