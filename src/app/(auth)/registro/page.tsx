"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { RegisterValues, registerSchema } from "@/lib/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/proyectos");
    }
  }, [isAuthenticated, router]);

  async function onSubmit(values: RegisterValues) {
    setError(null);

    try {
      await registerUser(values.nombre, values.correo, values.clave);
      toast.success("Cuenta creada. Inicia sesión para continuar.");
      router.replace("/login");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al crear la cuenta";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate para comenzar a gestionar proyectos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField id="nombre" label="Nombre" error={errors.nombre?.message}>
            <Input
              id="nombre"
              type="text"
              placeholder="Tu nombre completo"
              aria-invalid={errors.nombre ? true : undefined}
              {...register("nombre")}
            />
          </FormField>
          <FormField id="correo" label="Correo electrónico" error={errors.correo?.message}>
            <Input
              id="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              aria-invalid={errors.correo ? true : undefined}
              {...register("correo")}
            />
          </FormField>
          <FormField id="clave" label="Contraseña" error={errors.clave?.message}>
            <Input
              id="clave"
              type="password"
              placeholder="Mínimo 6 caracteres"
              aria-invalid={errors.clave ? true : undefined}
              {...register("clave")}
            />
          </FormField>
          <FormField
            id="confirmarClave"
            label="Confirmar contraseña"
            error={errors.confirmarClave?.message}
          >
            <Input
              id="confirmarClave"
              type="password"
              placeholder="Repite la contraseña"
              aria-invalid={errors.confirmarClave ? true : undefined}
              {...register("confirmarClave")}
            />
          </FormField>
          <LoadingButton className="w-full" loading={isSubmitting} loadingText="Creando cuenta...">
            Registrarse
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="ml-1 font-medium text-primary">
          Inicia sesión
        </Link>
      </CardFooter>
    </Card>
  );
}