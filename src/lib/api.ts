import { tokenStorage } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data as { message?: string })?.message ??
      (data as { error?: string })?.error ??
      "Ha ocurrido un error en la solicitud";

    if (response.status === 401) {
      const hadSession = tokenStorage.hasSession();
      tokenStorage.clearSession();

      if (hadSession && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const authApi = {
  register: (payload: { nombre: string; correo: string; clave: string }) =>
    apiRequest<{ message: string; usuario: unknown }>("/auth/registro", {
      method: "POST",
      body: payload,
    }),
  login: (payload: { correo: string; clave: string }) =>
    apiRequest<{
      message: string;
      access_token: string;
      usuario: { id: number; nombre: string; correo: string };
    }>("/auth/login", { method: "POST", body: payload }),
};

export const projectsApi = {
  findAll: (token: string) =>
    apiRequest<Project[]>("/proyectos", { token }),
  create: (token: string, payload: CreateProjectPayload) =>
    apiRequest<Project>("/proyectos", { method: "POST", body: payload, token }),
  update: (token: string, id: number, payload: CreateProjectPayload) =>
    apiRequest<Project>(`/proyectos/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    }),
  remove: (token: string, id: number) =>
    apiRequest<{ message: string }>(`/proyectos/${id}`, {
      method: "DELETE",
      token,
    }),
};

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