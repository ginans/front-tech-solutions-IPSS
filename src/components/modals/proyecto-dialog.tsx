"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectPayload, Project, projectsApi } from "@/lib/projects";
import { getErrorMessage } from "@/lib/http";
import { ESTADOS, ProjectValues, projectSchema } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { LoadingButton } from "@/components/ui/loading-button";

const emptyForm: ProjectValues = {
  nombre: "",
  fechaInicio: "",
  estado: "Planificado",
  responsable: "",
  monto: "",
};

interface ProyectoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

export function ProyectoDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProyectoDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    mode: "onTouched",
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;

    setError(null);

    reset(
      project
        ? {
            nombre: project.nombre,
            fechaInicio: project.fechaInicio.slice(0, 10),
            estado: project.estado as ProjectValues["estado"],
            responsable: project.responsable,
            monto: String(project.monto),
          }
        : emptyForm,
    );
  }, [open, project, reset]);

  async function onSubmit(values: ProjectValues) {
    setError(null);

    const payload: CreateProjectPayload = {
      nombre: values.nombre,
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      estado: values.estado,
      responsable: values.responsable,
      monto: Number(values.monto),
    };

    try {
      if (project) {
        await projectsApi.update(project.id, payload);
        toast.success("Proyecto actualizado");
      } else {
        await projectsApi.create(payload);
        toast.success("Proyecto creado");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar proyecto" : "Nuevo proyecto"}
          </DialogTitle>
          <DialogDescription>Completa los datos del proyecto</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <FormField
              id="nombre"
              label="Nombre"
              error={errors.nombre?.message}
            >
              <Input
                id="nombre"
                placeholder="Nombre del proyecto"
                aria-invalid={errors.nombre ? true : undefined}
                {...register("nombre")}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="fechaInicio"
                label="Fecha de inicio"
                error={errors.fechaInicio?.message}
              >
                <Input
                  id="fechaInicio"
                  type="date"
                  aria-invalid={errors.fechaInicio ? true : undefined}
                  {...register("fechaInicio")}
                />
              </FormField>
              <FormField id="estado" label="Estado">
                <Controller
                  control={control}
                  name="estado"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="responsable"
                label="Responsable"
                error={errors.responsable?.message}
              >
                <Input
                  id="responsable"
                  placeholder="Nombre del responsable"
                  aria-invalid={errors.responsable ? true : undefined}
                  {...register("responsable")}
                />
              </FormField>
              <FormField id="monto" label="Monto" error={errors.monto?.message}>
                <Input
                  id="monto"
                  inputMode="decimal"
                  placeholder="0"
                  aria-invalid={errors.monto ? true : undefined}
                  {...register("monto")}
                />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <LoadingButton loading={isSubmitting} loadingText="Guardando...">
              {project ? "Actualizar" : "Crear"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}