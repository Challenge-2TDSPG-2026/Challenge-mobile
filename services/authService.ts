import {
  salvarSessao,
  carregarSessao,
  removerSessao,
  verificarLogoutExplicito,
  salvarContaConhecida,
  buscarTipoContaConhecida,
} from '../storage/petStorage';
import type { Sessao } from '../storage/petStorage';
import type { TipoConta } from '../types';
export class ContaNaoEncontradaError extends Error {
  constructor() {
    super('Conta não encontrada');
    this.name = 'ContaNaoEncontradaError';
  }
}

export const authService = {

  async login(email: string, senha: string): Promise<Sessao> {
    const emailNormalizado = email.trim().toLowerCase();
    const tipoConta = await buscarTipoContaConhecida(emailNormalizado);
    if (!tipoConta) {
      throw new ContaNaoEncontradaError();
    }

    const sessao: Sessao = {
      email: emailNormalizado,
      token: `fake-token-${Date.now()}`,
      criadaEm: new Date().toISOString(),
      tipoConta,
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

  async getTipoContaAtual(): Promise<TipoConta | null> {
    const sessao = await carregarSessao();
    return sessao?.tipoConta ?? null;
  },

  async estaExplicitamenteDeslogado(): Promise<boolean> {
    return verificarLogoutExplicito();
  },

  async loginDev(email: string, senha: string, tipoConta: TipoConta): Promise<Sessao> {
    await salvarContaConhecida(email, tipoConta);
    return this.login(email, senha);
  },
};