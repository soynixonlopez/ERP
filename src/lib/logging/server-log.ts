/**
 * Logs en servidor sin volcar objetos completos ni datos sensibles en producción.
 * En desarrollo permite más detalle para depuración local.
 */

const isDev = process.env.NODE_ENV === "development";

type JsonSafe = Record<string, string | number | boolean | undefined>;

function pickErrorFields(err: unknown): JsonSafe {
  if (err && typeof err === "object") {
    const o = err as { message?: unknown; code?: unknown; name?: unknown };
    const out: JsonSafe = {};
    if (typeof o.message === "string") {
      out.message = o.message.slice(0, 800);
    }
    if (typeof o.code === "string") {
      out.code = o.code;
    }
    if (typeof o.name === "string") {
      out.name = o.name;
    }
    if (Object.keys(out).length > 0) {
      return out;
    }
  }
  return { message: String(err).slice(0, 800) };
}

/**
 * Error estructurado (una línea JSON en producción; en dev incluye el objeto para stack).
 */
export function logServerError(scope: string, err: unknown, extra?: JsonSafe): void {
  const payload: JsonSafe = { scope, ...pickErrorFields(err), ...extra };
  if (isDev) {
    console.error(JSON.stringify(payload), err);
  } else {
    console.error(JSON.stringify(payload));
  }
}

export function logServerWarn(scope: string, message: string, extra?: JsonSafe): void {
  const payload: JsonSafe = { scope, message: message.slice(0, 500), ...extra };
  console.warn(JSON.stringify(payload));
}

/** Rate limit: nunca registrar IPs completas en producción. */
export function logRateLimiterUnavailable(): void {
  if (isDev) {
    console.warn(JSON.stringify({ scope: "rate-limit", detail: "fail-open (dev)" }));
  } else {
    console.warn(JSON.stringify({ scope: "rate-limit", detail: "fail-open" }));
  }
}
