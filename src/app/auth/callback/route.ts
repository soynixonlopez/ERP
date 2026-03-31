import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/supabase/env";
import { getPostLoginRedirectPath } from "@/lib/auth/admin-access";
import { logServerError } from "@/lib/logging/server-log";

/**
 * PKCE: Supabase redirige aquí tras confirmar correo u OAuth (?code=...).
 * Configura en Supabase → Authentication → URL: Redirect URLs con
 * http://localhost:3000/auth/callback y tu dominio en producción.
 */

function safeInternalPath(next: string | null): string | null {
  if (!next || typeof next !== "string") return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");
  const nextParam = safeInternalPath(url.searchParams.get("next"));

  if (oauthError) {
    const msg = oauthDesc || oauthError;
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Falta codigo de autenticacion")}`);
  }

  const cookieStore = await cookies();
  const env = getClientEnv();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logServerError("auth/callback.exchangeCodeForSession", error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message || "No se pudo completar el inicio de sesion")}`
    );
  }

  if (nextParam) {
    return NextResponse.redirect(`${origin}${nextParam}`);
  }

  const destination = await getPostLoginRedirectPath();
  return NextResponse.redirect(`${origin}${destination}`);
}
