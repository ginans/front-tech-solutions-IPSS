"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "./api";
import { tokenStorage } from "./auth-storage";

interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, clave: string) => Promise<void>;
  register: (nombre: string, correo: string, clave: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = tokenStorage.getToken();
    const storedUser = tokenStorage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (correo: string, clave: string) => {
    const result = await authApi.login({ correo, clave });
    setToken(result.access_token);
    setUser(result.usuario);
    tokenStorage.setSession(result.access_token, result.usuario);
  }, []);

  const register = useCallback(
    async (nombre: string, correo: string, clave: string) => {
      await authApi.register({ nombre, correo, clave });
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    tokenStorage.clearSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}