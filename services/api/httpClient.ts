import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';
import { STORAGE_KEYS } from '../../constants';

export class ApiError extends Error {
  status: number;
  campos?: Record<string, string>;

  constructor(status: number, mensagem: string, campos?: Record<string, string>) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos;
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: Metodo;
  path: string;
  body?: unknown;
  autenticado?: boolean;
}

async function obterToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSAO);
  if (!raw) return null;
  try {
    const sessao = JSON.parse(raw);
    return sessao?.token ?? null;
  } catch {
    return null;
  }
}

function extrairErro(status: number, corpo: any): ApiError {
  if (corpo && typeof corpo === 'object') {
    if (corpo.campos && typeof corpo.campos === 'object') {
      const primeiraMsg = Object.values(corpo.campos)[0];
      return new ApiError(
        status,
        typeof primeiraMsg === 'string' ? primeiraMsg : 'Dados inválidos.',
        corpo.campos
      );
    }
    if (typeof corpo.mensagem === 'string') {
      return new ApiError(status, corpo.mensagem);
    }
  }
  return new ApiError(status, 'Não foi possível completar a solicitação. Tente novamente.');
}

export async function apiRequest<T = unknown>({
  method,
  path,
  body,
  autenticado = true,
}: RequestOptions): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (autenticado) {
    const token = await obterToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique sua conexão e se o servidor está no ar.');
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw extrairErro(resposta.status, corpo);
  }

  return corpo as T;
}

export const api = {
  get: <T>(path: string, autenticado = true) => apiRequest<T>({ method: 'GET', path, autenticado }),
  post: <T>(path: string, body?: unknown, autenticado = true) =>
    apiRequest<T>({ method: 'POST', path, body, autenticado }),
  put: <T>(path: string, body?: unknown, autenticado = true) =>
    apiRequest<T>({ method: 'PUT', path, body, autenticado }),
  patch: <T>(path: string, body?: unknown, autenticado = true) =>
    apiRequest<T>({ method: 'PATCH', path, body, autenticado }),
  delete: <T = void>(path: string, autenticado = true) =>
    apiRequest<T>({ method: 'DELETE', path, autenticado }),
};