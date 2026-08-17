"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Project, projectsApi } from "@/lib/projects";
import { getErrorMessage } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProyectosTable } from "@/components/tables/proyectos-table";
import { ProyectoDialog } from "@/components/modals/proyecto-dialog";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";

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

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    setError(null);
    try {
      setProjects(await projectsApi.findAll());
    } catch (err) {
      setError(getErrorMessage(err));
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
    setDialogOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!token || !pendingDelete) return;

    setDeleting(true);

    try {
      await projectsApi.remove(pendingDelete.id);
      toast.success("Proyecto eliminado");
      setPendingDelete(null);
      loadProjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
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
              <ProyectosTable
                projects={projects}
                onEdit={openEditDialog}
                onDelete={setPendingDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ProyectoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSuccess={loadProjects}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="¿Eliminar proyecto?"
        description="Esta acción no se puede deshacer. Estás por eliminar el proyecto"
        emphasis={pendingDelete?.nombre}
        confirmLabel="Eliminar"
        loadingText="Eliminando..."
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </main>
  );
}