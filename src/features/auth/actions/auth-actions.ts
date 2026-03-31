"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostLoginRedirectPath } from "@/lib/auth/admin-access";
import { isEmailNotConfirmedError, mapSignInError, mapSignUpError } from "@/lib/auth/map-auth-error";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import { toProperCase } from "@/lib/utils/proper-case";
import { sanitizeText } from "@/lib/utils/sanitize";
import { logServerError } from "@/lib/logging/server-log";

export type AuthActionState = {
  error?: string;
  /** Mostrar reenvío de confirmación (Supabase: correo no confirmado). */
  hint?: "resend";
};

export type ResendConfirmationState = {
  error?: string;
  ok?: boolean;
};

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulario invalido" };
  }

  const email = sanitizeText(String(parsed.data.email)).toLowerCase();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password
  });
  if (error) {
    logServerError("signInAction", error);
    return {
      error: mapSignInError(error),
      hint: isEmailNotConfirmedError(error) ? "resend" : undefined
    };
  }

  redirect(await getPostLoginRedirectPath());
}

export async function resendSignupConfirmationAction(
  _prev: ResendConfirmationState,
  formData: FormData
): Promise<ResendConfirmationState> {
  const email = sanitizeText(String(formData.get("email") ?? "")).toLowerCase();
  if (!email) {
    return { error: "Indica tu correo en el campo de arriba." };
  }

  const appBase = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const emailRedirectTo = appBase ? `${appBase}/auth/callback` : undefined;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: emailRedirectTo ? { emailRedirectTo } : undefined
  });

  if (error) {
    logServerError("resendSignupConfirmationAction", error);
    return { error: mapSignUpError(error) };
  }

  return { ok: true };
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    cedula: String(formData.get("cedula") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on" || formData.get("acceptTerms") === "true"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulario invalido" };
  }

  const fullName = toProperCase(sanitizeText(parsed.data.fullName));
  const email = sanitizeText(parsed.data.email).toLowerCase();

  const appBase = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const emailRedirectTo = appBase ? `${appBase}/auth/callback` : undefined;

  const supabase = await createSupabaseServerClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: fullName,
        cedula: sanitizeText(parsed.data.cedula),
        numero: sanitizeText(parsed.data.numero)
      }
    }
  });

  if (error) {
    logServerError("signUpAction", error);
    return { error: mapSignUpError(error) };
  }

  // Con "confirmar correo" desactivado, Supabase devuelve sesión y el usuario entra al instante.
  if (signUpData.session) {
    redirect(await getPostLoginRedirectPath());
  }

  // Con confirmación por correo activa: no hay sesión hasta hacer clic en el enlace del email.
  redirect(`/register/confirm-email?email=${encodeURIComponent(email)}`);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
