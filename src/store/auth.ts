import { create } from "zustand";
import { api, setToken } from "../api/client";
import type { AuthResponse, User } from "../api/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      const res = await api.get<{ user: User }>("/auth/me");
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    await setToken(data.token);
    set({ user: data.user });
    return data.user;
  },
  register: async (name, email, password) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      role: "student",
    });
    await setToken(data.token);
    set({ user: data.user });
    return data.user;
  },
  logout: async () => {
    await setToken(null);
    set({ user: null });
  },
}));
