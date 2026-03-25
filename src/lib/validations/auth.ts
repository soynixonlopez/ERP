import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La clave debe tener minimo 8 caracteres")
});

export const signUpSchema = z.object({
  fullName: z.string().min(3, "Nombre muy corto").max(100, "Nombre muy largo"),
  cedula: z
    .string()
    .min(4, "Cédula muy corta")
    .max(20, "Cédula muy larga")
    .regex(/^[0-9]+$/, "Cédula debe contener solo números"),
  numero: z
    .string()
    .min(7, "Número muy corto")
    .max(20, "Número muy largo")
    .regex(/^[0-9+]+$/, "Número inválido"),
  email: z.string().email("Email invalido"),
  password: z
    .string()
    .min(8, "La clave debe tener minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayuscula")
    .regex(/[0-9]/, "Debe incluir al menos un numero"),
  acceptTerms: z
    .boolean()
    .refine((v) => v === true, "Debes autorizar el uso de tus datos personales")
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
