import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import type { Pet } from '../types';

const CHAVE_PETS = ['pets'] as const;
const chavePet = (id: string) => ['pets', id] as const;

export function usePets(habilitado: boolean) {
  return useQuery({
    queryKey: CHAVE_PETS,
    queryFn: petService.listarPets,
    enabled: habilitado,
  });
}

export function usePetPorId(id: string | null, habilitado: boolean) {
  return useQuery({
    queryKey: chavePet(id ?? ''),
    queryFn: () => petService.buscarPorId(id as string),
    enabled: habilitado && id !== null,
    staleTime: 60_000,
  });
}

export function useCriarPet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pet: Pet) => petService.criarPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_PETS });
    },
  });
}

export function useAtualizarPet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pet: Pet) => petService.atualizarPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_PETS });
    },
  });
}

export function useRemoverPet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => petService.removerPet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_PETS });
    },
  });
}