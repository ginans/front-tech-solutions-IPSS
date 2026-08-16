"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  ApiError,
  CreateProjectPayload,
  Project,
  projectsApi,
} from "@/lib/api";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ESTADOS = ["Planificado", "En progreso", "En revisión", "Finalizado"];

const emptyForm = {
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
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    setForm({
      nombre: project.nombre,
      fechaInicio: project.fechaInicio.slice(0, 10),
      estado: project.estado,
      responsable: project.responsable,
      monto: String(project.monto),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);

    const payload: CreateProjectPayload = {
      nombre: form.nombre,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      estado: form.estado,
      responsable: form.responsable,
      monto: Number(form.monto),
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
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!token) return;

    if (!window.confirm(`¿Eliminar el proyecto "${project.nombre}"?`)) {
      return;
    }

    try {
      await projectsApi.remove(token, project.id);
      toast.success("Proyecto eliminado");
      loadProjects();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al eliminar el proyecto";
      toast.error(message);
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
                            onClick={() => handleDelete(project)}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                placeholder="Nombre del proyecto"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm({ ...form, fechaInicio: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(value) =>
                    setForm({ ...form, estado: value ?? "Planificado" })
                  }
                >
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  value={form.responsable}
                  onChange={(e) =>
                    setForm({ ...form, responsable: e.target.value })
                  }
                  placeholder="Nombre del responsable"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  type="number"
                  min="0"
                  step="any"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  placeholder="0"
                  required
                />
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
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : editingProject
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}