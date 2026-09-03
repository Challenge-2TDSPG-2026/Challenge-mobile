import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { veterinarioService } from '../services/veterinarioService';

const chaveVet = (id: string) => ['veterinario', id] as const;
const chaveDisponibilidade = (id: string) => ['veterinario', id, 'disponibilidade'] as const;
const chaveBloqueios = (id: string) => ['veterinario', id, 'bloqueios'] as const;

export function useVeterinarioAtual(id: string | null, habilitado: boolean) {
  return useQuery({
    queryKey: chaveVet(id ?? ''),
    queryFn: () => veterinarioService.buscarPorId(id as string),
    enabled: habilitado && id !== null,
  });
}

export function useDisponibilidade(idVeterinario: string | null, habilitado: boolean) {
  return useQuery({
    queryKey: chaveDisponibilidade(idVeterinario ?? ''),
    queryFn: () => veterinarioService.listarDisponibilidade(idVeterinario as string),
    enabled: habilitado && idVeterinario !== null,
  });
}

export function useAdicionarFaixaDisponibilidade(idVeterinario: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (faixa: { diaSemana: number; horaInicio: string; horaFim: string }) =>
      veterinarioService.adicionarFaixaDisponibilidade(idVeterinario as string, faixa),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveDisponibilidade(idVeterinario ?? '') }),
  });
}

export function useRemoverFaixaDisponibilidade(idVeterinario: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idFaixa: string) => veterinarioService.removerFaixaDisponibilidade(idVeterinario as string, idFaixa),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveDisponibilidade(idVeterinario ?? '') }),
  });
}

export function useBloqueios(idVeterinario: string | null, habilitado: boolean) {
  return useQuery({
    queryKey: chaveBloqueios(idVeterinario ?? ''),
    queryFn: () => veterinarioService.listarBloqueios(idVeterinario as string),
    enabled: habilitado && idVeterinario !== null,
  });
}

export function useAdicionarBloqueio(idVeterinario: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bloqueio: { dataInicio: string; dataFim: string; motivo?: string }) =>
      veterinarioService.adicionarBloqueio(idVeterinario as string, bloqueio),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveBloqueios(idVeterinario ?? '') }),
  });
}

export function useRemoverBloqueio(idVeterinario: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idBloqueio: string) => veterinarioService.removerBloqueio(idVeterinario as string, idBloqueio),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveBloqueios(idVeterinario ?? '') }),
  });
}