import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const baseURL =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ??
  "http://localhost:4000/api";

export const api = axios.create({ baseURL });

const TOKEN_KEY = "campus_events_token";

export async function setToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
  cachedToken = token;
}

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken !== null) return cachedToken;
  const t = await SecureStore.getItemAsync(TOKEN_KEY);
  cachedToken = t;
  return t;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      await setToken(null);
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string }>;
  return e.response?.data?.error ?? e.message ?? "Unknown error";
}
