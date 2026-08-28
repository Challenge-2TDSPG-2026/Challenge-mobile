import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Pet, Evento, Recompensa, StatusEventoExibicao } from '../types';
import { META_CONSULTAS_RECOMPENSA, XP_POR_EVENTO, NIVEIS, CONQUISTAS } from '../constants';
import {
  salvarEventos,
  carregarEventos,
  marcarOnboardingConcluido,
  verificarOnboardingConcluido,
  salvarPreferencias,
  carregarPreferencias,
  resetarTodosDados,
} from '../storage/petStorage';
import { petService } from '../services/petService';
import { recompensaService } from '../services/recompensaService';

function statusExibicao(e: Evento): StatusEventoExibicao {
  if (e.status === 'concluido' || e.status === 'cancelado') return e.status;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(e.data); d.setHours(0, 0, 0, 0);
  return d < hoje ? 'atrasado' : e.status;
}

export interface NivelInfo {
  nivel: number;
  titulo: string;
  xpAtual: number;
  xpMinAtual: number;
  xpMinProximo: number | null;
  progressoPct: number;
  xpFaltaProximoNivel: number | null;
}

export interface ConquistaComStatus {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
  desbloqueada: boolean;
}

type PetContextValue = {
  pets: Pet[];
  petAtivo: Pet | null;
  petAtivoId: string | null;
  selecionarPet: (id: string) => Promise<void>;
  adicionarPet: (pet: Pet) => Promise<void>;
  removerPet: (id: string) => Promise<void>;
  eventos: Evento[];
  preferencias: Record<string, boolean>;
  onboardingConcluido: boolean;
  carregando: boolean;
  adicionarEvento: (evento: Evento) => Promise<void>;
  removerEvento: (id: string) => Promise<void>;
  atualizarPreferencias: (prefs: Record<string, boolean>) => Promise<void>;
  resetar: () => Promise<void>;

  recompensas: Recompensa[];
  metaConsultas: number;
  consultasConcluidasTotal: number;
  consultasNoCicloAtual: number;
  recompensasDisponiveis: Recompensa[];
  resgatarRecompensa: (id: string) => Promise<void>;
  nivelInfo: NivelInfo;
  conquistas: ConquistaComStatus[];
  conquistasDesbloqueadas: ConquistaComStatus[];
};

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petAtivoId, setPetAtivoId] = useState<string | null>(null);
  const [eventosTodos, setEventosTodos] = useState<Evento[]>([]);
  const [preferencias, setPreferencias] = useState<Record<string, boolean>>({
    ativas: true,
    lembrete7: true,
    lembreteAntes: true,
  });
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [recompensasTodas, setRecompensasTodas] = useState<Recompensa[]>([]);

  useEffect(() => {
    async function inicializar() {
      try {
        const [petsSalvos, ativoIdSalvo, eventosSalvos, onboarding, prefsSalvas, recompensasSalvas] = await Promise.all([
          petService.listarPets(),
          petService.getPetAtivoId(),
          carregarEventos(),
          verificarOnboardingConcluido(),
          carregarPreferencias(),
          recompensaService.listarRecompensas(),
        ]);
        setPets(petsSalvos);
        const ativoValido = ativoIdSalvo && petsSalvos.some(p => p.id === ativoIdSalvo)
          ? ativoIdSalvo
          : (petsSalvos[0]?.id ?? null);
        setPetAtivoId(ativoValido);
        setEventosTodos(eventosSalvos);
        setOnboardingConcluido(onboarding);
        setPreferencias(prefsSalvas);
        setRecompensasTodas(recompensasSalvas);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      } finally {
        setCarregando(false);
      }
    }
    inicializar();
  }, []);

  const petAtivo = useMemo(() => pets.find(p => p.id === petAtivoId) ?? null, [pets, petAtivoId]);

  const selecionarPet = useCallback(async (id: string) => {
    await petService.setPetAtivoId(id);
    setPetAtivoId(id);
  }, []);

  const adicionarPet = useCallback(async (pet: Pet) => {
    const novos = await petService.adicionarPet(pet, pets);
    setPets(novos);
    await petService.setPetAtivoId(pet.id);
    setPetAtivoId(pet.id);
    if (!onboardingConcluido) {
      await marcarOnboardingConcluido();
      setOnboardingConcluido(true);
    }
  }, [pets, onboardingConcluido]);

  const removerPet = useCallback(async (id: string) => {
    const novos = await petService.removerPet(id, pets);
    setPets(novos);
    if (petAtivoId === id) {
      const novoAtivo = novos[0]?.id ?? null;
      setPetAtivoId(novoAtivo);
      if (novoAtivo) await petService.setPetAtivoId(novoAtivo);
    }
  }, [pets, petAtivoId]);

  const eventos = useMemo(
    () => eventosTodos.filter(e => e.petId === petAtivoId),
    [eventosTodos, petAtivoId]
  );

  const adicionarEvento = useCallback(async (evento: Evento) => {
    setEventosTodos(prev => {
      const novos = [...prev, evento];
      salvarEventos(novos);
      return novos;
    });
  }, []);

  const removerEvento = useCallback(async (id: string) => {
    setEventosTodos(prev => {
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
    setPets([]);
    setPetAtivoId(null);
    setEventosTodos([]);
    setOnboardingConcluido(false);
    setPreferencias({ ativas: true, lembrete7: true, lembreteAntes: true });
    setRecompensasTodas([]);
  }, []);

  // --- Recompensas escopadas ao pet ativo ---
  const recompensas = useMemo(
    () => recompensasTodas.filter(r => r.petId === petAtivoId),
    [recompensasTodas, petAtivoId]
  );

  const consultasConcluidasTotal = useMemo(
    () => eventos.filter(e => e.tipo === 'consulta' && e.status === 'concluido').length,
    [eventos]
  );

  useEffect(() => {
    if (carregando || !petAtivoId) return;
    const deveriaTer = Math.floor(consultasConcluidasTotal / META_CONSULTAS_RECOMPENSA);
    const jaTem = recompensasTodas.filter(r => r.petId === petAtivoId).length;
    const faltam = deveriaTer - jaTem;
    if (faltam <= 0) return;

    async function gerarNovasRecompensas() {
      let listaAtual = recompensasTodas;
      for (let i = 0; i < faltam; i++) {
        const nova: Recompensa = {
          id: `${Date.now()}-${i}`,
          petId: petAtivoId!,
          criadaEm: new Date().toISOString(),
          resgatada: false,
        };
        listaAtual = await recompensaService.adicionarRecompensa(nova, listaAtual);
      }
      setRecompensasTodas(listaAtual);
    }
    gerarNovasRecompensas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultasConcluidasTotal, carregando, petAtivoId]);

  const consultasNoCicloAtual = useMemo(
    () => consultasConcluidasTotal - recompensas.length * META_CONSULTAS_RECOMPENSA,
    [consultasConcluidasTotal, recompensas.length]
  );

  const recompensasDisponiveis = useMemo(
    () => recompensas.filter(r => !r.resgatada),
    [recompensas]
  );

  const resgatarRecompensa = useCallback(async (id: string) => {
    const novas = await recompensaService.resgatarRecompensa(id, recompensasTodas);
    setRecompensasTodas(novas);
  }, [recompensasTodas]);

  // --- Nível / XP (do pet ativo) ---
  const eventosConcluidosTotal = useMemo(
    () => eventos.filter(e => e.status === 'concluido').length,
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

  // --- Conquistas (do pet ativo) ---
  const eventosComStatus = useMemo(
    () => eventos.map(e => ({ ...e, statusExibicao: statusExibicao(e) })),
    [eventos]
  );

  const conquistas: ConquistaComStatus[] = useMemo(() => {
    const vacinas = eventosComStatus.filter(e => e.tipo === 'vacina');
    const temAtraso = eventosComStatus.some(e => e.statusExibicao === 'atrasado');
    const temVacinaAtrasada = vacinas.some(e => e.statusExibicao === 'atrasado');

    const regras: Record<string, boolean> = {
      'primeiro-cadastro': petAtivo !== null,
      'primeira-consulta': eventos.some(e => e.tipo === 'consulta' && e.status === 'concluido'),
      'cinco-eventos': eventosConcluidosTotal >= 5,
      'vinte-eventos': eventosConcluidosTotal >= 20,
      'vacinacao-em-dia': vacinas.length > 0 && !temVacinaAtrasada,
      'sem-atrasos': eventos.length > 0 && !temAtraso,
      'dez-registros': eventos.length >= 10,
      'primeiro-resgate': recompensas.some(r => r.resgatada),
    };

    return CONQUISTAS.map(c => ({
      ...c,
      desbloqueada: regras[c.id] ?? false,
    }));
  }, [petAtivo, eventos, eventosComStatus, eventosConcluidosTotal, recompensas]);

  const conquistasDesbloqueadas = useMemo(
    () => conquistas.filter(c => c.desbloqueada),
    [conquistas]
  );

  return (
    <PetContext.Provider
      value={{
        pets,
        petAtivo,
        petAtivoId,
        selecionarPet,
        adicionarPet,
        removerPet,
        eventos,
        preferencias,
        onboardingConcluido,
        carregando,
        adicionarEvento,
        removerEvento,
        atualizarPreferencias,
        resetar,
        recompensas,
        metaConsultas: META_CONSULTAS_RECOMPENSA,
        consultasConcluidasTotal,
        consultasNoCicloAtual,
        recompensasDisponiveis,
        resgatarRecompensa,
        nivelInfo,
        conquistas,
        conquistasDesbloqueadas,
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