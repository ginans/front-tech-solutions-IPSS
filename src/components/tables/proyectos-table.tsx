"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Project } from "@/lib/projects";
import { formatFecha, formatMoneda } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProyectosTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProyectosTable({
  projects,
  onEdit,
  onDelete,
}: ProyectosTableProps) {
  return (
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
            <TableCell className="font-medium">{project.nombre}</TableCell>
            <TableCell>{formatFecha(project.fechaInicio)}</TableCell>
            <TableCell>{project.estado}</TableCell>
            <TableCell>{project.responsable}</TableCell>
            <TableCell className="text-right">
              {formatMoneda(project.monto)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${project.nombre}`}
                  onClick={() => onEdit(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${project.nombre}`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}