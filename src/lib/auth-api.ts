import { http } from "./http";

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  usuario: AuthUser;
}

export interface RegisterResponse {
  message: string;
  usuario: AuthUser;
}

export const authApi = {
  register: (payload: { nombre: string; correo: string; clave: string }) =>
    http
      .post<RegisterResponse>("/auth/registro", payload)
      .then((res) => res.data),

  login: (payload: { correo: string; clave: string }) =>
    http.post<LoginResponse>("/auth/login", payload).then((res) => res.data),
};