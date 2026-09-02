import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Pet, Evento } from '../types';
import { XP_POR_EVENTO, NIVEIS } from '../constants';
import {
  salvarPetAtivoId,
  carregarPetAtivoId,
  salvarPreferencias,
  carregarPreferencias,
  resetarPreferenciasLocais,
} from '../storage/petStorage';
import { useAuth } from './AuthContext';
import { usePets, useCriarPet, useRemoverPet } from '../hooks/usePets';
import { useEventos } from '../hooks/useEventos';

export interface NivelInfo {
  nivel: number;
  titulo: string;
  xpAtual: number;
  xpMinAtual: number;
  xpMinProximo: number | null;
  progressoPct: number;
  xpFaltaProximoNivel: number | null;
}

type PetContextValue = {
  // --- Pets (API) ---
  pets: Pet[];
  petAtivo: Pet | null;
  petAtivoId: string | null;
  selecionarPet: (id: string) => void;
  adicionarPet: (pet: Pet) => Promise<void>;
  removerPet: (id: string) => Promise<void>;
  salvandoPet: boolean;

  // --- Eventos do pet ativo (API) ---
  eventos: Evento[];
  carregandoEventos: boolean;

  // --- Preferências locais de UI ---
  preferencias: Record<string, boolean>;
  atualizarPreferencias: (prefs: Record<string, boolean>) => Promise<void>;

  // --- Estado geral ---
  onboardingConcluido: boolean;
  carregando: boolean;
  resetarPreferencias: () => Promise<void>;

  // --- Nível/XP (do pet ativo) ---
  nivelInfo: NivelInfo;
};

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [petAtivoId, setPetAtivoIdState] = useState<string | null>(null);
  const [preferencias, setPreferencias] = useState<Record<string, boolean>>({
    ativas: true,
    lembrete7: true,
    lembreteAntes: true,
  });
  const [carregandoLocal, setCarregandoLocal] = useState(true);

  // Preferências e pet ativo salvo são só UI local — carregados uma vez no mount.
  useEffect(() => {
    async function carregarLocal() {
      const [ativoSalvo, prefsSalvas] = await Promise.all([
        carregarPetAtivoId(),
        carregarPreferencias(),
      ]);
      setPetAtivoIdState(ativoSalvo);
      setPreferencias(prefsSalvas);
      setCarregandoLocal(false);
    }
    carregarLocal();
  }, []);

  const habilitado = autenticado && !carregandoAuth;

  const { data: pets = [], isLoading: carregandoPets } = usePets(habilitado);
  const { data: eventosTodos = [], isLoading: carregandoEventos } = useEventos(habilitado);

  const criarPetMutation = useCriarPet();
  const removerPetMutation = useRemoverPet();

  // Garante que petAtivoId sempre aponte para um pet que realmente existe:
  // corrige tanto o carregamento inicial (id salvo de sessão anterior que já
  // não existe mais) quanto remoções (pet ativo removido -> escolhe outro).
  useEffect(() => {
    if (carregandoPets) return;
    const aindaExiste = petAtivoId !== null && pets.some(p => p.id === petAtivoId);
    if (aindaExiste) return;

    const novoAtivo = pets[0]?.id ?? null;
    setPetAtivoIdState(novoAtivo);
    if (novoAtivo) {
      salvarPetAtivoId(novoAtivo);
    }
  }, [pets, carregandoPets, petAtivoId]);

  const petAtivo = useMemo(() => pets.find(p => p.id === petAtivoId) ?? null, [pets, petAtivoId]);

  const selecionarPet = useCallback((id: string) => {
    setPetAtivoIdState(id);
    salvarPetAtivoId(id);
  }, []);

  const adicionarPet = useCallback(async (pet: Pet) => {
    const criado = await criarPetMutation.mutateAsync(pet);
    setPetAtivoIdState(criado.id);
    await salvarPetAtivoId(criado.id);
  }, [criarPetMutation]);

  const removerPet = useCallback(async (id: string) => {
    await removerPetMutation.mutateAsync(id);
    // A reatribuição do pet ativo (se este era o ativo) é feita pelo
    // useEffect acima assim que a lista de pets for revalidada.
  }, [removerPetMutation]);

  // --- Eventos escopados ao pet ativo ---
  const eventos = useMemo(
    () => eventosTodos.filter(e => e.petId === petAtivoId),
    [eventosTodos, petAtivoId]
  );

  const atualizarPreferencias = useCallback(async (prefs: Record<string, boolean>) => {
    await salvarPreferencias(prefs);
    setPreferencias(prefs);
  }, []);

  const resetarPreferencias = useCallback(async () => {
    await resetarPreferenciasLocais();
    setPetAtivoIdState(null);
    setPreferencias({ ativas: true, lembrete7: true, lembreteAntes: true });
  }, []);

  // Onboarding concluído é derivado de haver pelo menos 1 pet cadastrado na
  // API — não é mais uma flag local, para não divergir do estado real do
  // servidor (ex: tutor que já cadastrou pet em outro dispositivo).
  const onboardingConcluido = pets.length > 0;

  const carregando = carregandoAuth || carregandoLocal || (habilitado && carregandoPets);

  // --- Nível / XP (do pet ativo) ---
  const eventosConcluidosTotal = useMemo(
    () => eventos.filter(e => e.status === 'CONCLUIDO').length,
    [eventos]
  );

  const nivelInfo: NivelInfo = useMemo(() => {
    const xpAtual = eventosConcluidosTotal * XP_POR_EVENTO;
    let atual: (typeof NIVEIS)[number] = NIVEIS[0];
    let proximo: (typeof NIVEIS)[number] | null = null;
    for (let i = 0; i < NIVEIS.length; i++) {
      if (xpAtual >= NIVEIS[i].xpMin) {
        atual = NIVEIS[i];
        proximo = NIVEIS[i + 1] ?? null;
      }
    }
    const xpMinAtual = atual.xpMin;
    const xpMinProximo = proximo?.xpMin ?? null;
    const progressoPct = xpMinProximo
      ? Math.min(100, Math.round(((xpAtual - xpMinAtual) / (xpMinProximo - xpMinAtual)) * 100))
      : 100;
    return {
      nivel: atual.nivel,
      titulo: atual.titulo,
      xpAtual,
      xpMinAtual,
      xpMinProximo,
      progressoPct,
      xpFaltaProximoNivel: xpMinProximo ? xpMinProximo - xpAtual : null,
    };
  }, [eventosConcluidosTotal]);

  return (
    <PetContext.Provider
      value={{
        pets,
        petAtivo,
        petAtivoId,
        selecionarPet,
        adicionarPet,
        removerPet,
        salvandoPet: criarPetMutation.isPending,
        eventos,
        carregandoEventos,
        preferencias,
        atualizarPreferencias,
        onboardingConcluido,
        carregando,
        resetarPreferencias,
        nivelInfo,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet() deve ser usado dentro de <PetProvider>');
  return ctx;
}