import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVet } from '../../context/VetContext';
import { ESPECIES, TIPOS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';

const C = {
  g800: '#0e3326', g600: '#1a7a52', g500: '#22a06b', g200: '#a8e6c7', g100: '#d4f2e4',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function VetPacientesScreen() {
  const router = useRouter();
  const { pacientes } = useVet();
  const [busca, setBusca] = useState('');

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = termo
      ? pacientes.filter(p => p.pet.nome.toLowerCase().includes(termo))
      : pacientes;
    return [...lista].sort((a, b) => a.pet.nome.localeCompare(b.pet.nome));
  }, [pacientes, busca]);

  return (
    <View style={s.container}>

      <View style={s.buscaBar}>
        <AppIcon name="search-outline" set="Ionicons" size={18} color={C.muted} />
        <TextInput
          style={s.buscaInput}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar paciente pelo nome..."
          placeholderTextColor={C.muted}
        />
        {busca.length > 0 && (
          <Pressable onPress={() => setBusca('')} hitSlop={8}>
            <AppIcon name="close-circle" set="Ionicons" size={18} color={C.muted} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {pacientesFiltrados.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="paw-outline" set="Ionicons" size={40} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>
              {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente ainda'}
            </Text>
            <Text style={s.emptySub}>
              {busca
                ? 'Tente buscar por outro nome'
                : 'Pets com solicitações ou consultas atendidas por você aparecem aqui'}
            </Text>
          </View>
        ) : (
          pacientesFiltrados.map(({ pet, eventos }) => {
            const especieInfo = ESPECIES.find(e => e.valor === pet.especie);
            const ultimoEvento = eventos[0];
            const t = ultimoEvento ? TIPOS_EVENTO.find(x => x.valor === ultimoEvento.tipo) : null;
            return (
              <Pressable
                key={pet.id}
                style={s.card}
                onPress={() => router.push(`/paciente/${pet.id}`)}
              >
                <View style={s.avatar}>
                  <AppIcon
                    name={especieInfo?.icon ?? 'paw'}
                    set={especieInfo?.iconSet ?? 'MaterialCommunityIcons'}
                    size={22}
                    color={C.g600}
                  />
                </View>
                <View style={s.info}>
                  <Text style={s.nome}>{pet.nome}</Text>
                  <Text style={s.detalhe}>
                    {especieInfo?.label}{pet.raca ? ` • ${pet.raca}` : ''}
                  </Text>
                  {ultimoEvento && (
                    <View style={s.ultimoRow}>
                      <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={11} color={C.muted} />
                      <Text style={s.ultimoTexto}>
                        {t?.label} • {formatarData(ultimoEvento.data)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={s.contagem}>
                  <Text style={s.contagemValor}>{eventos.length}</Text>
                  <Text style={s.contagemLabel}>evento{eventos.length !== 1 ? 's' : ''}</Text>
                </View>
                <AppIcon name="chevron-forward" set="Ionicons" size={18} color={C.muted} />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  buscaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 8,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buscaInput: { flex: 1, fontSize: 14, color: C.text },

  scrollContent: { padding: 16, paddingTop: 8, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.g100, justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  nome: { fontSize: 14, fontWeight: '700', color: C.text },
  detalhe: { fontSize: 12, color: C.muted, marginTop: 2 },
  ultimoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  ultimoTexto: { fontSize: 11, color: C.muted },

  contagem: { alignItems: 'center', marginRight: 4 },
  contagemValor: { fontSize: 16, fontWeight: '700', color: C.g600 },
  contagemLabel: { fontSize: 9, color: C.muted },

  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 24 },
});