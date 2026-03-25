import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La clave debe tener minimo 8 caracteres")
});

export const signUpSchema = z.object({
  fullName: z.string().min(3, "Nombre muy corto").max(100, "Nombre muy largo"),
  email: z.string().email("Email invalido"),
  password: z
    .string()
    .min(8, "La clave debe tener minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayuscula")
    .regex(/[0-9]/, "Debe incluir al menos un numero")
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
