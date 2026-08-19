import { salvarSessao, carregarSessao, removerSessao } from '../storage/petStorage';
import type { Sessao } from '../storage/petStorage';

export const authService = {
  async registrar(email: string, senha: string): Promise<Sessao> {
    const sessao: Sessao = {
      email: email.trim().toLowerCase(),
      token: `fake-token-${Date.now()}`,
      criadaEm: new Date().toISOString(),
    };
    await salvarSessao(sessao);
    return sessao;
  },

  async login(email: string, senha: string): Promise<Sessao> {
    const sessao: Sessao = {
      email: email.trim().toLowerCase(),
      token: `fake-token-${Date.now()}`,
      criadaEm: new Date().toISOString(),
    };
    await salvarSessao(sessao);
    return sessao;
  },

  async logout(): Promise<void> {
    await removerSessao();
  },

  async getSessaoAtual(): Promise<Sessao | null> {
    return carregarSessao();
  },

  async estaAutenticado(): Promise<boolean> {
    const sessao = await carregarSessao();
    return sessao !== null;
  },
};