import { salvarPets, carregarPets, salvarPetAtivoId, carregarPetAtivoId } from '../storage/petStorage';
import type { Pet } from '../types';

export const petService = {
  async listarPets(): Promise<Pet[]> {
    return carregarPets();
  },
  async adicionarPet(pet: Pet, listaAtual: Pet[]): Promise<Pet[]> {
    const novos = [...listaAtual, pet];
    await salvarPets(novos);
    return novos;
  },
  async removerPet(id: string, listaAtual: Pet[]): Promise<Pet[]> {
    const novos = listaAtual.filter(p => p.id !== id);
    await salvarPets(novos);
    return novos;
  },
  async getPetAtivoId(): Promise<string | null> {
    return carregarPetAtivoId();
  },
  async setPetAtivoId(id: string): Promise<void> {
    await salvarPetAtivoId(id);
  },
};