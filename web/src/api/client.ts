import axios, { AxiosError } from "axios";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:4000/api";

export const api = axios.create({ baseURL });

const TOKEN_KEY = "campus_events_token";

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      setToken(null);
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string }>;
  return e.response?.data?.error ?? e.message ?? "Unknown error";
}
