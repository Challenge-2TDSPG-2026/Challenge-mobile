import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Pet, Evento } from '../types';
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

  useEffect(() => {
    async function inicializar() {
      try {
        const [petSalvo, eventosSalvos, onboarding, prefsSalvas] = await Promise.all([
          carregarPet(),
          carregarEventos(),
          verificarOnboardingConcluido(),
          carregarPreferencias(),
        ]);
        if (petSalvo) setPet(petSalvo);
        setEventos(eventosSalvos);
        setOnboardingConcluido(onboarding);
        setPreferencias(prefsSalvas);
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
