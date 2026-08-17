const TOKEN_KEY = "token";
const USER_KEY = "user";
const AUTH_COOKIE = "auth_token";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 8;

export interface StoredUser {
  id: number;
  nombre: string;
  correo: string;
}

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  hasSession(): boolean {
    return Boolean(this.getToken());
  },

  setSession(token: string, user: StoredUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
      token,
    )}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; samesite=lax`;
  },

  clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  },
};

export { AUTH_COOKIE };