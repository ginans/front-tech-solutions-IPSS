import axios from "axios";
import { tokenStorage } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadSession = tokenStorage.hasSession();
      tokenStorage.clearSession();

      if (
        hadSession &&
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      const { message, error: errorText } = data as {
        message?: unknown;
        error?: unknown;
      };

      if (Array.isArray(message)) {
        return message.join(", ");
      }

      if (typeof message === "string" && message.length > 0) {
        return message;
      }

      if (typeof errorText === "string") {
        return errorText;
      }
    }

    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ha ocurrido un error en la solicitud";
}