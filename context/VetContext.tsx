import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Pet, Evento, Veterinario, FaixaDisponibilidade, BloqueioAgenda } from '../types';
import { petService } from '../services/petService';
import { eventoService } from '../services/eventoService';
import { veterinarioService } from '../services/veterinarioService';

export interface PacienteComHistorico {
  pet: Pet;
  eventos: Evento[];
}

type VetContextValue = {
  // --- Pets (visão global, necessária para exibir nome do pet nas telas do veterinário) ---
  pets: Pet[];

  // --- Veterinário logado ---
  veterinarios: Veterinario[];
  veterinarioAtivo: Veterinario | null;
  veterinarioAtivoId: string | null;
  carregando: boolean;
  cadastrarVeterinario: (veterinario: Veterinario) => Promise<void>;
  selecionarVeterinario: (id: string) => Promise<void>;

  // --- Consultas (visão global — não escopada a um único pet) ---
  eventos: Evento[];
  eventosSolicitados: Evento[];
  eventosConfirmados: Evento[];
  eventosDeHoje: Evento[];
  confirmarEvento: (id: string) => Promise<void>;
  concluirEvento: (id: string, observacoesClinicas?: string) => Promise<void>;
  cancelarEvento: (id: string, motivo: string) => Promise<void>;

  // --- Pacientes ---
  pacientes: PacienteComHistorico[];

  // --- Disponibilidade / bloqueios do veterinário ativo ---
  disponibilidade: FaixaDisponibilidade[];
  adicionarFaixaDisponibilidade: (faixa: FaixaDisponibilidade) => Promise<void>;
  removerFaixaDisponibilidade: (id: string) => Promise<void>;
  bloqueios: BloqueioAgenda[];
  adicionarBloqueio: (bloqueio: BloqueioAgenda) => Promise<void>;
  removerBloqueio: (id: string) => Promise<void>;
};

const VetContext = createContext<VetContextValue | undefined>(undefined);

export function VetProvider({ children }: { children: React.ReactNode }) {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [veterinarioAtivoId, setVeterinarioAtivoId] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [disponibilidadeTodas, setDisponibilidadeTodas] = useState<FaixaDisponibilidade[]>([]);
  const [bloqueiosTodos, setBloqueiosTodos] = useState<BloqueioAgenda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function inicializar() {
      try {
        const [
          veterinariosSalvos,
          ativoIdSalvo,
          petsSalvos,
          eventosSalvos,
          disponibilidadeSalva,
          bloqueiosSalvos,
        ] = await Promise.all([
          veterinarioService.listarVeterinarios(),
          veterinarioService.getVeterinarioAtivoId(),
          petService.listarPets(),
          eventoService.listarEventos(),
          veterinarioService.listarDisponibilidade(),
          veterinarioService.listarBloqueios(),
        ]);
        setVeterinarios(veterinariosSalvos);
        const ativoValido = ativoIdSalvo && veterinariosSalvos.some(v => v.id === ativoIdSalvo)
          ? ativoIdSalvo
          : (veterinariosSalvos[0]?.id ?? null);
        setVeterinarioAtivoId(ativoValido);
        setPets(petsSalvos);
        setEventos(eventosSalvos);
        setDisponibilidadeTodas(disponibilidadeSalva);
        setBloqueiosTodos(bloqueiosSalvos);
      } catch (e) {
        console.error('Erro ao carregar dados do veterinário:', e);
      } finally {
        setCarregando(false);
      }
    }
    inicializar();
  }, []);

  const veterinarioAtivo = useMemo(
    () => veterinarios.find(v => v.id === veterinarioAtivoId) ?? null,
    [veterinarios, veterinarioAtivoId]
  );

  const cadastrarVeterinario = useCallback(async (veterinario: Veterinario) => {
    const novos = await veterinarioService.adicionarVeterinario(veterinario, veterinarios);
    setVeterinarios(novos);
    await veterinarioService.setVeterinarioAtivoId(veterinario.id);
    setVeterinarioAtivoId(veterinario.id);
  }, [veterinarios]);

  const selecionarVeterinario = useCallback(async (id: string) => {
    await veterinarioService.setVeterinarioAtivoId(id);
    setVeterinarioAtivoId(id);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Consultas — visão global do veterinário
  // ─────────────────────────────────────────────────────────

  const eventosSolicitados = useMemo(
    () => eventos.filter(e => e.status === 'solicitado'),
    [eventos]
  );

  const eventosConfirmados = useMemo(
    () => eventos.filter(e => e.status === 'confirmado' && e.veterinarioId === veterinarioAtivoId),
    [eventos, veterinarioAtivoId]
  );

  const eventosDeHoje = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
    return eventos
      .filter(e => {
        const d = new Date(e.data);
        return d >= hoje && d < amanha && e.status !== 'cancelado';
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [eventos]);

  const confirmarEvento = useCallback(async (id: string) => {
    if (!veterinarioAtivoId) return;
    const novos = await eventoService.confirmarEvento(id, veterinarioAtivoId, eventos);
    setEventos(novos);
  }, [eventos, veterinarioAtivoId]);

  const concluirEvento = useCallback(async (id: string, observacoesClinicas?: string) => {
    const novos = await eventoService.concluirEvento(id, eventos, observacoesClinicas);
    setEventos(novos);
  }, [eventos]);

  const cancelarEvento = useCallback(async (id: string, motivo: string) => {
    const novos = await eventoService.cancelarEvento(id, motivo, eventos);
    setEventos(novos);
  }, [eventos]);

  // ─────────────────────────────────────────────────────────
  // Pacientes — pets com pelo menos 1 evento solicitado ou
  // atendido por este veterinário
  // ─────────────────────────────────────────────────────────

  const pacientes: PacienteComHistorico[] = useMemo(() => {
    const petIdsRelevantes = new Set(
      eventos
        .filter(e => e.status === 'solicitado' || e.veterinarioId === veterinarioAtivoId)
        .map(e => e.petId)
    );
    return pets
      .filter(p => petIdsRelevantes.has(p.id))
      .map(pet => ({
        pet,
        eventos: eventos
          .filter(e => e.petId === pet.id)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
      }));
  }, [pets, eventos, veterinarioAtivoId]);

  // ─────────────────────────────────────────────────────────
  // Disponibilidade / bloqueios do veterinário ativo
  // ─────────────────────────────────────────────────────────

  const disponibilidade = useMemo(
    () => disponibilidadeTodas.filter(f => f.veterinarioId === veterinarioAtivoId),
    [disponibilidadeTodas, veterinarioAtivoId]
  );

  const adicionarFaixaDisponibilidade = useCallback(async (faixa: FaixaDisponibilidade) => {
    const novas = await veterinarioService.adicionarFaixaDisponibilidade(faixa, disponibilidadeTodas);
    setDisponibilidadeTodas(novas);
  }, [disponibilidadeTodas]);

  const removerFaixaDisponibilidade = useCallback(async (id: string) => {
    const novas = await veterinarioService.removerFaixaDisponibilidade(id, disponibilidadeTodas);
    setDisponibilidadeTodas(novas);
  }, [disponibilidadeTodas]);

  const bloqueios = useMemo(
    () => bloqueiosTodos.filter(b => b.veterinarioId === veterinarioAtivoId),
    [bloqueiosTodos, veterinarioAtivoId]
  );

  const adicionarBloqueio = useCallback(async (bloqueio: BloqueioAgenda) => {
    const novos = await veterinarioService.adicionarBloqueio(bloqueio, bloqueiosTodos);
    setBloqueiosTodos(novos);
  }, [bloqueiosTodos]);

  const removerBloqueio = useCallback(async (id: string) => {
    const novos = await veterinarioService.removerBloqueio(id, bloqueiosTodos);
    setBloqueiosTodos(novos);
  }, [bloqueiosTodos]);

  return (
    <VetContext.Provider
      value={{
        pets,
        veterinarios,
        veterinarioAtivo,
        veterinarioAtivoId,
        carregando,
        cadastrarVeterinario,
        selecionarVeterinario,
        eventos,
        eventosSolicitados,
        eventosConfirmados,
        eventosDeHoje,
        confirmarEvento,
        concluirEvento,
        cancelarEvento,
        pacientes,
        disponibilidade,
        adicionarFaixaDisponibilidade,
        removerFaixaDisponibilidade,
        bloqueios,
        adicionarBloqueio,
        removerBloqueio,
      }}
    >
      {children}
    </VetContext.Provider>
  );
}

export function useVet(): VetContextValue {
  const ctx = useContext(VetContext);
  if (!ctx) throw new Error('useVet() deve ser usado dentro de <VetProvider>');
  return ctx;
}