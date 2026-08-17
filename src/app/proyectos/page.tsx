"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError, CreateProjectPayload, Project, projectsApi } from "@/lib/api";
import { ESTADOS, ProjectValues, projectSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function ProyectosPage() {
  const router = useRouter();
  const { token, user, logout, isLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    setError(null);
    try {
      setProjects(await projectsApi.findAll(token));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error al cargar proyectos",
      );
    } finally {
      setLoadingProjects(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token, loadProjects]);

  function openCreateDialog() {
    setEditingProject(null);
    reset(emptyForm);
    setError(null);
    setDialogOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    reset({
      nombre: project.nombre,
      fechaInicio: project.fechaInicio.slice(0, 10),
      estado: project.estado as ProjectValues["estado"],
      responsable: project.responsable,
      monto: String(project.monto),
    });
    setError(null);
    setDialogOpen(true);
  }

  async function onSubmit(values: ProjectValues) {
    if (!token) return;
    setError(null);

    const payload: CreateProjectPayload = {
      nombre: values.nombre,
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      estado: values.estado,
      responsable: values.responsable,
      monto: Number(values.monto),
    };

    try {
      if (editingProject) {
        await projectsApi.update(token, editingProject.id, payload);
        toast.success("Proyecto actualizado");
      } else {
        await projectsApi.create(token, payload);
        toast.success("Proyecto creado");
      }
      setDialogOpen(false);
      loadProjects();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al guardar el proyecto";
      setError(message);
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!token || !pendingDelete) return;

    setDeleting(true);

    try {
      await projectsApi.remove(token, pendingDelete.id);
      toast.success("Proyecto eliminado");
      setPendingDelete(null);
      loadProjects();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al eliminar el proyecto";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (isLoading || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Tech Solutions</h1>
              <p className="text-xs text-muted-foreground">
                Sistema de Gestión de Proyectos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-muted-foreground sm:block">
              {user?.nombre}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Proyectos</h2>
            <p className="text-sm text-muted-foreground">
              Administra los proyectos de la empresa
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo proyecto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de proyectos</CardTitle>
            <CardDescription>
              Información retornada por el controlador de proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loadingProjects ? (
              <p className="py-8 text-center text-muted-foreground">
                Cargando proyectos...
              </p>
            ) : projects.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No hay proyectos registrados. Crea uno para comenzar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.nombre}
                      </TableCell>
                      <TableCell>
                        {new Date(project.fechaInicio).toLocaleDateString(
                          "es-CL",
                        )}
                      </TableCell>
                      <TableCell>{project.estado}</TableCell>
                      <TableCell>{project.responsable}</TableCell>
                      <TableCell className="text-right">
                        {project.monto.toLocaleString("es-CL", {
                          style: "currency",
                          currency: "CLP",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar ${project.nombre}`}
                            onClick={() => openEditDialog(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Eliminar ${project.nombre}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(project)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar proyecto" : "Nuevo proyecto"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos del proyecto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <FormField id="nombre" label="Nombre" error={errors.nombre?.message}>
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
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <LoadingButton
                loading={isSubmitting}
                loadingText="Guardando..."
              >
                {editingProject ? "Actualizar" : "Crear"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Estás por eliminar el proyecto{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.nombre}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}