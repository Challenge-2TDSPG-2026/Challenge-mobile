import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePet } from '../context/PetContext';
import { AppIcon } from './AppIcon';
import { ESPECIES } from '../constants';

const C = {
  g600: '#1a7a52', g500: '#22a06b',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff', w50: '#f9f7f4',
};

export function PetSwitcher() {
  const router = useRouter();
  const { pets, petAtivoId, selecionarPet } = usePet();

  if (pets.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.container}
      contentContainerStyle={s.content}
    >
      {pets.map(p => {
        const especieInfo = ESPECIES.find(e => e.valor === p.especie);
        const ativo = p.id === petAtivoId;
        return (
          <Pressable
            key={p.id}
            style={[s.chip, ativo && s.chipAtivo]}
            onPress={() => selecionarPet(p.id)}
          >
            <AppIcon
              name={especieInfo?.icon ?? 'paw'}
              set={especieInfo?.iconSet ?? 'MaterialCommunityIcons'}
              size={16}
              color={ativo ? C.white : C.muted}
            />
            <Text style={[s.chipText, ativo && s.chipTextAtivo]} numberOfLines={1}>
              {p.nome}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={s.addBtn} onPress={() => router.push('/add-pet')}>
        <AppIcon name="add" set="Ionicons" size={16} color={C.g600} />
        <Text style={s.addBtnText}>Novo pet</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 0, marginBottom: 14 },
  content: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.w50, borderWidth: 1.5, borderColor: C.border,
    maxWidth: 140,
  },
  chipAtivo: { backgroundColor: C.g600, borderColor: C.g600 },
  chipText: { fontSize: 12, fontWeight: '600', color: C.text },
  chipTextAtivo: { color: C.white },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.g500, borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: C.g600 },
});