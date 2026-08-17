import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),
  clave: z.string().min(1, "La contraseña es requerida"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es requerido")
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    correo: z
      .string()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo válido"),
    clave: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const ESTADOS = ["Planificado", "En progreso", "En revisión", "Finalizado"] as const;

export const projectSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  fechaInicio: z
    .string()
    .min(1, "La fecha de inicio es requerida"),
  estado: z.enum(ESTADOS),
  responsable: z
    .string()
    .min(1, "El responsable es requerido")
    .min(3, "El responsable debe tener al menos 3 caracteres"),
  monto: z
    .string()
    .min(1, "El monto es requerido")
    .regex(/^\d+(\.\d+)?$/, "Ingresa un monto válido")
    .refine((value) => Number(value) >= 0, "El monto no puede ser negativo"),
});

export type ProjectValues = z.infer<typeof projectSchema>;