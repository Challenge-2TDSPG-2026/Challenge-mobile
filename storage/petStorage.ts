import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import type { Pet, Evento, Recompensa } from '../types';

export async function salvarPets(pets: Pet[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
}

export async function carregarPets(): Promise<Pet[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.PETS);
  if (!raw) return [];
  return JSON.parse(raw) as Pet[];
}

export async function salvarPetAtivoId(id: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PET_ATIVO, id);
}

export async function carregarPetAtivoId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.PET_ATIVO);
}

export async function salvarEventos(eventos: Evento[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
}

export async function carregarEventos(): Promise<Evento[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTOS);
  if (!raw) return [];
  return JSON.parse(raw) as Evento[];
}

export async function marcarOnboardingConcluido(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_CONCLUIDO, 'true');
}

export async function verificarOnboardingConcluido(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_CONCLUIDO);
  return val === 'true';
}

export async function salvarPreferencias(prefs: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(prefs));
}

export async function carregarPreferencias(): Promise<Record<string, boolean>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICACOES);
  if (!raw) return { ativas: true, lembrete7: true, lembreteAntes: true };
  return JSON.parse(raw);
}

export interface Sessao {
  email: string;
  token: string;
  criadaEm: string;
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSAO, JSON.stringify(sessao));
}

export async function carregarSessao(): Promise<Sessao | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSAO);
  if (!raw) return null;
  return JSON.parse(raw) as Sessao;
}

export async function removerSessao(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SESSAO);
}

export async function salvarRecompensas(recompensas: Recompensa[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.RECOMPENSAS, JSON.stringify(recompensas));
}

export async function carregarRecompensas(): Promise<Recompensa[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECOMPENSAS);
  if (!raw) return [];
  return JSON.parse(raw) as Recompensa[];
}

export async function resetarTodosDados(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.PETS,
    STORAGE_KEYS.PET_ATIVO,
    STORAGE_KEYS.EVENTOS,
    STORAGE_KEYS.ONBOARDING_CONCLUIDO,
    STORAGE_KEYS.NOTIFICACOES,
    STORAGE_KEYS.SESSAO,
    STORAGE_KEYS.RECOMPENSAS,
  ]);
}