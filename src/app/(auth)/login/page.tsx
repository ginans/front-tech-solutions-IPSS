"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { LoginValues, loginSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/proyectos");
    }
  }, [isAuthenticated, router]);

  async function onSubmit(values: LoginValues) {
    setError(null);

    try {
      await login(values.correo, values.clave);
      toast.success("Inicio de sesión exitoso");
      router.replace("/proyectos");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al iniciar sesión";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Tech Solutions</CardTitle>
        <CardDescription>
          Inicia sesión para acceder a la gestión de proyectos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              aria-invalid={errors.correo ? true : undefined}
              {...register("correo")}
            />
            {errors.correo && (
              <p className="text-sm font-medium text-destructive">
                {errors.correo.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clave">Contraseña</Label>
            <Input
              id="clave"
              type="password"
              placeholder="••••••••"
              aria-invalid={errors.clave ? true : undefined}
              {...register("clave")}
            />
            {errors.clave && (
              <p className="text-sm font-medium text-destructive">
                {errors.clave.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="ml-1 font-medium text-primary">
          Regístrate
        </Link>
      </CardFooter>
    </Card>
  );
}