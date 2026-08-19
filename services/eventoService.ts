import { salvarEventos, carregarEventos } from '../storage/petStorage';
import type { Evento } from '../types';

export const eventoService = {
    async listarEventos(): Promise<Evento[]> {
        return carregarEventos();
    },
    async adicionarEvento(evento: Evento, listaAtual: Evento[]): Promise<Evento[]> {
        const novos = [...listaAtual, evento];
        await salvarEventos(novos);
        return novos;
    },
    async concluirEvento(id: string, listaAtual: Evento[]): Promise<Evento[]> {
        const novos = listaAtual.map(e =>
            e.id === id ? { ...e, status: 'concluido' as const } : e
        );
        await salvarEventos(novos);
        return novos;
    },
    async removerEvento(id: string, listaAtual: Evento[]): Promise<Evento[]> {
        const novos = listaAtual.filter(e => e.id !== id);
        await salvarEventos(novos);
        return novos;
    },
};