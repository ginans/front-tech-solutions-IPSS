import { http } from "./http";

export interface Project {
  id: number;
  nombre: string;
  fechaInicio: string;
  estado: string;
  responsable: string;
  monto: number;
  createdBy: number;
}

export interface CreateProjectPayload {
  nombre: string;
  fechaInicio: string;
  estado: string;
  responsable: string;
  monto: number;
}

export const projectsApi = {
  findAll: () => http.get<Project[]>("/proyectos").then((res) => res.data),

  create: (payload: CreateProjectPayload) =>
    http.post<Project>("/proyectos", payload).then((res) => res.data),

  update: (id: number, payload: CreateProjectPayload) =>
    http.patch<Project>(`/proyectos/${id}`, payload).then((res) => res.data),

  remove: (id: number) =>
    http.delete<{ message: string }>(`/proyectos/${id}`).then((res) => res.data),
};