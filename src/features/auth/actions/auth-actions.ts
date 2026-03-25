"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostLoginRedirectPath } from "@/lib/auth/admin-access";
import { mapSignUpError } from "@/lib/auth/map-auth-error";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import { toProperCase } from "@/lib/utils/proper-case";
import { sanitizeText } from "@/lib/utils/sanitize";

type AuthActionState = {
  error?: string;
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
    return { error: "No fue posible iniciar sesion" };
  }

  redirect(await getPostLoginRedirectPath());
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: fullName,
        cedula: sanitizeText(parsed.data.cedula),
        numero: sanitizeText(parsed.data.numero)
      }
    }
  });

  if (error) {
    console.error("[signUpAction]", error.message, error);
    return { error: mapSignUpError(error) };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    redirect(await getPostLoginRedirectPath());
  }

  redirect("/login?registered=1");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
