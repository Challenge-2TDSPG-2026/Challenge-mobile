import type { Evento } from '../types';

export type StatusExibicao = 'pendente' | 'atrasado' | 'concluido' | 'cancelado';

export function parseDataEvento(iso: string): Date {
  return iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
}

export function statusExibicao(evento: Evento): StatusExibicao {
  if (evento.status === 'CONCLUIDO') return 'concluido';
  if (evento.status === 'CANCELADO') return 'cancelado';

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const data = parseDataEvento(evento.data); data.setHours(0, 0, 0, 0);
  return data < hoje ? 'atrasado' : 'pendente';
}

export const STATUS_EXIBICAO_BADGE: Record<StatusExibicao, { bg: string; color: string; label: string }> = {
  pendente: { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
  concluido: { bg: '#dcfce7', color: '#166534', label: 'Realizado' },
  atrasado: { bg: '#fee2e2', color: '#991b1b', label: 'Atrasado' },
  cancelado: { bg: '#f0ece5', color: '#7a6a5e', label: 'Cancelado' },
};

export function formatarDataEvento(iso: string): string {
  return parseDataEvento(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}