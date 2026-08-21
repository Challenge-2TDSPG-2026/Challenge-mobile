import { salvarRecompensas, carregarRecompensas } from '../storage/petStorage';
import type { Recompensa } from '../types';

export const recompensaService = {
  async listarRecompensas(): Promise<Recompensa[]> {
    return carregarRecompensas();
  },

  async adicionarRecompensa(recompensa: Recompensa, listaAtual: Recompensa[]): Promise<Recompensa[]> {
    const novas = [...listaAtual, recompensa];
    await salvarRecompensas(novas);
    return novas;
  },

  async resgatarRecompensa(id: string, listaAtual: Recompensa[]): Promise<Recompensa[]> {
    const novas = listaAtual.map(r =>
      r.id === id ? { ...r, resgatada: true, resgatadaEm: new Date().toISOString() } : r
    );
    await salvarRecompensas(novas);
    return novas;
  },
};