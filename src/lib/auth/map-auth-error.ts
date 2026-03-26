import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduce errores comunes de signUp de Supabase a mensajes útiles en español.
 */
export function mapSignUpError(error: AuthError): string {
  const m = (error.message ?? "").toLowerCase();

  if (
    m.includes("already registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already registered") ||
    m.includes("duplicate")
  ) {
    return "Ese correo ya está registrado. Prueba iniciar sesión.";
  }

  if (m.includes("database error saving new user")) {
    return "Error al guardar el usuario (base de datos). Revisa triggers o extensiones en Supabase vinculadas a auth.users.";
  }

  if (m.includes("signup") && (m.includes("disabled") || m.includes("not allowed"))) {
    return "El registro está desactivado en Authentication → Providers de tu proyecto Supabase.";
  }

  if (m.includes("invalid api key") || m.includes("jwt")) {
    return "Configuración de Supabase incorrecta (clave anon o URL). Revisa .env.local.";
  }

  if (m.includes("email rate limit") || (m.includes("rate limit") && m.includes("email"))) {
    return "Demasiados intentos con este correo. Espera unos minutos e intenta de nuevo.";
  }

  if (m.includes("password") && (m.includes("weak") || m.includes("least") || m.includes("characters"))) {
    return "La contraseña no cumple los requisitos que configuraste en Supabase (longitud o complejidad).";
  }

  if (m.includes("invalid email") || m.includes("email format")) {
    return "El formato del correo no es válido.";
  }

  // Mensaje original suele ser claro en inglés; lo mostramos para depuración sin ocultar la causa
  return `No fue posible crear la cuenta: ${error.message}`;
}

export function isEmailNotConfirmedError(error: AuthError): boolean {
  const m = (error.message ?? "").toLowerCase();
  const code = String((error as { code?: string }).code ?? "").toLowerCase();
  return code === "email_not_confirmed" || m.includes("email not confirmed");
}

/**
 * Errores comunes de signIn (incluye correo sin confirmar).
 */
export function mapSignInError(error: AuthError): string {
  const m = (error.message ?? "").toLowerCase();
  const code = String((error as { code?: string }).code ?? "").toLowerCase();

  if (code === "email_not_confirmed" || m.includes("email not confirmed")) {
    return "Tu cuenta aún no está verificada para iniciar con contraseña. Revisa tu bandeja (y spam) o usa «Reenviar correo» abajo. Tras abrir el enlace del correo, podrás entrar.";
  }

  if (
    code === "invalid_credentials" ||
    m.includes("invalid login credentials") ||
    m.includes("invalid_credentials")
  ) {
    return "Correo o contraseña incorrectos. Si acabas de registrarte, confirma el correo primero.";
  }

  if (m.includes("email not found") || m.includes("user not found")) {
    return "No hay una cuenta con ese correo. Regístrate o revisa el correo escrito.";
  }

  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }

  return `No fue posible iniciar sesión: ${error.message}`;
}
