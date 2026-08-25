import {
  salvarVeterinarios,
  carregarVeterinarios,
  salvarVeterinarioAtivoId,
  carregarVeterinarioAtivoId,
  salvarDisponibilidade,
  carregarDisponibilidade,
  salvarBloqueios,
  carregarBloqueios,
} from '../storage/petStorage';
import type { Veterinario, FaixaDisponibilidade, BloqueioAgenda } from '../types';

export const veterinarioService = {
 
  async listarVeterinarios(): Promise<Veterinario[]> {
    return carregarVeterinarios();
  },

  async buscarPorId(id: string, listaAtual: Veterinario[]): Promise<Veterinario | null> {
    return listaAtual.find(v => v.id === id) ?? null;
  },

  async adicionarVeterinario(veterinario: Veterinario, listaAtual: Veterinario[]): Promise<Veterinario[]> {
    const novos = [...listaAtual, veterinario];
    await salvarVeterinarios(novos);
    return novos;
  },

  async atualizarVeterinario(veterinario: Veterinario, listaAtual: Veterinario[]): Promise<Veterinario[]> {
    const novos = listaAtual.map(v => (v.id === veterinario.id ? veterinario : v));
    await salvarVeterinarios(novos);
    return novos;
  },

  async getVeterinarioAtivoId(): Promise<string | null> {
    return carregarVeterinarioAtivoId();
  },

  async setVeterinarioAtivoId(id: string): Promise<void> {
    await salvarVeterinarioAtivoId(id);
  },

  async listarDisponibilidade(): Promise<FaixaDisponibilidade[]> {
    return carregarDisponibilidade();
  },

  async listarDisponibilidadeDoVeterinario(veterinarioId: string): Promise<FaixaDisponibilidade[]> {
    const todas = await carregarDisponibilidade();
    return todas.filter(f => f.veterinarioId === veterinarioId);
  },

  async adicionarFaixaDisponibilidade(
    faixa: FaixaDisponibilidade,
    listaAtual: FaixaDisponibilidade[],
  ): Promise<FaixaDisponibilidade[]> {
    const novas = [...listaAtual, faixa];
    await salvarDisponibilidade(novas);
    return novas;
  },

  async removerFaixaDisponibilidade(
    id: string,
    listaAtual: FaixaDisponibilidade[],
  ): Promise<FaixaDisponibilidade[]> {
    const novas = listaAtual.filter(f => f.id !== id);
    await salvarDisponibilidade(novas);
    return novas;
  },

  async listarBloqueios(): Promise<BloqueioAgenda[]> {
    return carregarBloqueios();
  },

  async listarBloqueiosDoVeterinario(veterinarioId: string): Promise<BloqueioAgenda[]> {
    const todos = await carregarBloqueios();
    return todos.filter(b => b.veterinarioId === veterinarioId);
  },

  async adicionarBloqueio(bloqueio: BloqueioAgenda, listaAtual: BloqueioAgenda[]): Promise<BloqueioAgenda[]> {
    const novos = [...listaAtual, bloqueio];
    await salvarBloqueios(novos);
    return novos;
  },

  async removerBloqueio(id: string, listaAtual: BloqueioAgenda[]): Promise<BloqueioAgenda[]> {
    const novos = listaAtual.filter(b => b.id !== id);
    await salvarBloqueios(novos);
    return novos;
  },

  horarioEstaDisponivel(
    dataISO: string,
    faixas: FaixaDisponibilidade[],
    bloqueios: BloqueioAgenda[],
  ): boolean {
    const data = new Date(dataISO);
    const diaSemana = data.getDay() as FaixaDisponibilidade['diaSemana'];
    const minutosNoDia = data.getHours() * 60 + data.getMinutes();
    const chaveData = dataISO.slice(0, 10); // YYYY-MM-DD

    const diaBloqueado = bloqueios.some(b => b.data.slice(0, 10) === chaveData);
    if (diaBloqueado) return false;

    return faixas.some(f => {
      if (f.diaSemana !== diaSemana) return false;
      const [horaIni, minIni] = f.horaInicio.split(':').map(Number);
      const [horaFim, minFim] = f.horaFim.split(':').map(Number);
      const inicio = horaIni * 60 + minIni;
      const fim = horaFim * 60 + minFim;
      return minutosNoDia >= inicio && minutosNoDia < fim;
    });
  },
};