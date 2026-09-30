import axios, { AxiosError } from "axios";
import { supabase } from "./supabase.js";

// ─────────────────────────────────────────────────────────────
// ApiError — error normalizado del backend
// ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  details?: string;
  lockedFields?: string[];
  hint?: string;

  constructor(
    message: string,
    status: number,
    options?: { details?: string; lockedFields?: string[]; hint?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = options?.details;
    this.lockedFields = options?.lockedFields;
    this.hint = options?.hint;
  }
}

// ─────────────────────────────────────────────────────────────
// Cliente axios
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "Falta VITE_API_URL en el .env. Revisá apps/web/.env y reiniciá el dev server.",
  );
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─────────────────────────────────────────────────────────────
// Interceptor de request — inyecta el JWT de Supabase
// ─────────────────────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// ─────────────────────────────────────────────────────────────
// Interceptor de response — normaliza errores
// ─────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorBody>) => {
    // Error sin respuesta del server (network, timeout, DNS, etc.)
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          error.message || "No se pudo conectar con el servidor",
          0,
        ),
      );
    }

    const { status, data } = error.response;

    return Promise.reject(
      new ApiError(
        data?.error || `Error ${status}`,
        status,
        {
          details: data?.details,
          lockedFields: data?.locked_fields,
          hint: data?.hint,
        },
      ),
    );
  },
);

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────

interface BackendErrorBody {
  success?: false;
  error?: string;
  details?: string;
  locked_fields?: string[];
  hint?: string;
}

export interface BackendSuccessBody<T> {
  success: true;
  data: T;
  message?: string;
}