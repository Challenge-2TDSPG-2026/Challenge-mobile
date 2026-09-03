import { api } from './api/httpClient';
import type { Evento, StatusEvento } from '../types';

interface EventoResponseApi {
  idEvento: number;
  status: StatusEvento;
  nmTipoEvento: string | null;
  dsCategoria: Evento['categoriaTipoEvento'];
  nmVeterinario: string | null;
  dtEvento: string;
  dsObservacao: string | null;
  motivoCancelamento: string | null;
  vlCusto: number | null;
  idPet: number | null;
}

function paraEventoApp(dto: EventoResponseApi, idTipoEvento: string, idVeterinario: string): Evento {
  return {
    id: String(dto.idEvento),
    petId: dto.idPet != null ? String(dto.idPet) : '',
    status: dto.status,
    idTipoEvento,
    nomeTipoEvento: dto.nmTipoEvento ?? 'Evento',
    categoriaTipoEvento: dto.dsCategoria ?? null,
    idVeterinario,
    nomeVeterinario: dto.nmVeterinario ?? '—',
    data: dto.dtEvento,
    observacao: dto.dsObservacao ?? undefined,
    motivoCancelamento: dto.motivoCancelamento ?? undefined,
    custo: dto.vlCusto ?? 0,
  };
}

interface SolicitarEventoInput {
  idPet: string;
  idTipoEvento: string;
  idVeterinario: string;
  data: string;
  observacao?: string;
}

export const eventoService = {

  async listarEventos(): Promise<Evento[]> {
    const dtos = await api.get<EventoResponseApi[]>('/eventos');
    return dtos.map(dto => paraEventoApp(dto, '', ''));
  },

  async solicitarEvento(input: SolicitarEventoInput): Promise<Evento> {
    const dto = await api.post<EventoResponseApi>('/eventos', {
      idPet: Number(input.idPet),
      idTipoEvento: Number(input.idTipoEvento),
      idVeterinario: Number(input.idVeterinario),
      dtEvento: input.data,
      dsObservacao: input.observacao ?? null,
    });
    return paraEventoApp(dto, input.idTipoEvento, input.idVeterinario);
  },

  async confirmarEvento(id: string): Promise<Evento> {
    const dto = await api.patch<EventoResponseApi>(`/eventos/${id}/confirmar`);
    return paraEventoApp(dto, '', '');
  },

  async concluirEvento(id: string, observacao?: string, custo?: number): Promise<Evento> {
    const dto = await api.patch<EventoResponseApi>(`/eventos/${id}/concluir`, {
      dsObservacao: observacao ?? null,
      vlCusto: custo ?? null,
    });
    return paraEventoApp(dto, '', '');
  },

  async cancelarEvento(id: string, motivo: string): Promise<Evento> {
    const dto = await api.patch<EventoResponseApi>(`/eventos/${id}/cancelar`, { motivo });
    return paraEventoApp(dto, '', '');
  },

  async removerEvento(id: string): Promise<void> {
    await api.delete(`/eventos/${id}`);
  },
};