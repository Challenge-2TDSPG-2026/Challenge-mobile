import { salvarPet, carregarPet } from '../storage/petStorage';
import type { Pet } from '../types';

export const petService = {
    async getPet(): Promise<Pet | null> {
        return carregarPet();
    },
    async savePet(pet: Pet): Promise<Pet> {
        await salvarPet(pet);
        return pet;
    },
};