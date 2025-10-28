import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/shared/types/user.types";

interface AuthState {
  user: User | null;
  token: string | null;
  defaultCurrency: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, defaultCurrency?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      defaultCurrency: null,
      isAuthenticated: false,
      setAuth: (user, token, defaultCurrency = "COP") =>
        set({ user, token, defaultCurrency, isAuthenticated: true }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          defaultCurrency: null,
          isAuthenticated: false,
        }),
    }),
    { name: "auth-storage" }
  )
);
