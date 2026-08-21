import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Pet, Evento, Recompensa } from '../types';
import { META_CONSULTAS_RECOMPENSA } from '../constants';
import {
  salvarPet,
  carregarPet,
  salvarEventos,
  carregarEventos,
  marcarOnboardingConcluido,
  verificarOnboardingConcluido,
  salvarPreferencias,
  carregarPreferencias,
  resetarTodosDados,
} from '../storage/petStorage';
import { recompensaService } from '../services/recompensaService';

type PetContextValue = {
  pet: Pet | null;
  eventos: Evento[];
  preferencias: Record<string, boolean>;
  onboardingConcluido: boolean;
  carregando: boolean;
  salvarNovoPet: (pet: Pet) => Promise<void>;
  adicionarEvento: (evento: Evento) => Promise<void>;
  concluirEvento: (id: string) => Promise<void>;
  removerEvento: (id: string) => Promise<void>;
  atualizarPreferencias: (prefs: Record<string, boolean>) => Promise<void>;
  resetar: () => Promise<void>;

  // --- Recompensas ---
  recompensas: Recompensa[];
  metaConsultas: number;
  consultasConcluidasTotal: number;
  consultasNoCicloAtual: number;
  recompensasDisponiveis: Recompensa[];
  resgatarRecompensa: (id: string) => Promise<void>;
};

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [preferencias, setPreferencias] = useState<Record<string, boolean>>({
    ativas: true,
    lembrete7: true,
    lembreteAntes: true,
  });
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);

  useEffect(() => {
    async function inicializar() {
      try {
        const [petSalvo, eventosSalvos, onboarding, prefsSalvas, recompensasSalvas] = await Promise.all([
          carregarPet(),
          carregarEventos(),
          verificarOnboardingConcluido(),
          carregarPreferencias(),
          recompensaService.listarRecompensas(),
        ]);
        if (petSalvo) setPet(petSalvo);
        setEventos(eventosSalvos);
        setOnboardingConcluido(onboarding);
        setPreferencias(prefsSalvas);
        setRecompensas(recompensasSalvas);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      } finally {
        setCarregando(false);
      }
    }
    inicializar();
  }, []);

  const salvarNovoPet = useCallback(async (novoPet: Pet) => {
    await salvarPet(novoPet);
    await marcarOnboardingConcluido();
    setPet(novoPet);
    setOnboardingConcluido(true);
  }, []);

  const adicionarEvento = useCallback(async (evento: Evento) => {
    setEventos(prev => {
      const novos = [...prev, evento];
      salvarEventos(novos);
      return novos;
    });
  }, []);

  const concluirEvento = useCallback(async (id: string) => {
    setEventos(prev => {
      const novos = prev.map(e =>
        e.id === id ? { ...e, status: 'concluido' as const } : e
      );
      salvarEventos(novos);
      return novos;
    });
  }, []);

  const removerEvento = useCallback(async (id: string) => {
    setEventos(prev => {
      const novos = prev.filter(e => e.id !== id);
      salvarEventos(novos);
      return novos;
    });
  }, []);

  const atualizarPreferencias = useCallback(async (prefs: Record<string, boolean>) => {
    await salvarPreferencias(prefs);
    setPreferencias(prefs);
  }, []);

  const resetar = useCallback(async () => {
    await resetarTodosDados();
    setPet(null);
    setEventos([]);
    setOnboardingConcluido(false);
    setPreferencias({ ativas: true, lembrete7: true, lembreteAntes: true });
    setRecompensas([]);
  }, []);

  // --- Cálculo de progresso: consultas concluídas ---
  const consultasConcluidasTotal = useMemo(
    () => eventos.filter(e => e.tipo === 'consulta' && e.status === 'concluido').length,
    [eventos]
  );

  // Quantas recompensas o tutor JÁ DEVERIA ter, dado o total de consultas concluídas.
  // Comparamos com o que já existe salvo e só criamos a diferença — nunca removemos
  // uma recompensa já concedida, mesmo que uma consulta seja desmarcada/removida depois.
  useEffect(() => {
    if (carregando) return;
    const deveriaTer = Math.floor(consultasConcluidasTotal / META_CONSULTAS_RECOMPENSA);
    const faltam = deveriaTer - recompensas.length;
    if (faltam <= 0) return;

    async function gerarNovasRecompensas() {
      let listaAtual = recompensas;
      for (let i = 0; i < faltam; i++) {
        const nova: Recompensa = {
          id: `${Date.now()}-${i}`,
          criadaEm: new Date().toISOString(),
          resgatada: false,
        };
        listaAtual = await recompensaService.adicionarRecompensa(nova, listaAtual);
      }
      setRecompensas(listaAtual);
    }
    gerarNovasRecompensas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultasConcluidasTotal, carregando]);

  const consultasNoCicloAtual = useMemo(
    () => consultasConcluidasTotal - recompensas.length * META_CONSULTAS_RECOMPENSA,
    [consultasConcluidasTotal, recompensas.length]
  );

  const recompensasDisponiveis = useMemo(
    () => recompensas.filter(r => !r.resgatada),
    [recompensas]
  );

  const resgatarRecompensa = useCallback(async (id: string) => {
    setRecompensas(prev => {
      recompensaService.resgatarRecompensa(id, prev).then(setRecompensas);
      return prev;
    });
  }, []);

  return (
    <PetContext.Provider
      value={{
        pet,
        eventos,
        preferencias,
        onboardingConcluido,
        carregando,
        salvarNovoPet,
        adicionarEvento,
        concluirEvento,
        removerEvento,
        atualizarPreferencias,
        resetar,
        recompensas,
        metaConsultas: META_CONSULTAS_RECOMPENSA,
        consultasConcluidasTotal,
        consultasNoCicloAtual,
        recompensasDisponiveis,
        resgatarRecompensa,
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