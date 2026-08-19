import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../context/PetContext';
import { CORES, TIPOS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import type { Evento } from '../../types';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5', w200: '#e0d8ce',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

type Filtro = 'todos' | 'atrasado' | 'vacina' | 'consulta' | 'vermifugo' | 'medicamento' | 'checkup' | 'outro';

const FILTROS: { valor: Filtro; label: string; icon: string; iconSet: 'Ionicons' | 'MaterialCommunityIcons' }[] = [
  { valor: 'todos', label: 'Todos', icon: 'apps-outline', iconSet: 'Ionicons' },
  { valor: 'atrasado', label: 'Atrasados', icon: 'alert-circle-outline', iconSet: 'Ionicons' },
  { valor: 'vacina', label: 'Vacina', icon: 'needle', iconSet: 'MaterialCommunityIcons' },
  { valor: 'consulta', label: 'Consulta', icon: 'medical-bag', iconSet: 'MaterialCommunityIcons' },
  { valor: 'vermifugo', label: 'Vermífugo', icon: 'bug-outline', iconSet: 'Ionicons' },
  { valor: 'medicamento', label: 'Medicamento', icon: 'medkit-outline', iconSet: 'Ionicons' },
  { valor: 'checkup', label: 'Check-up', icon: 'pulse-outline', iconSet: 'Ionicons' },
  { valor: 'outro', label: 'Outro', icon: 'document-text-outline', iconSet: 'Ionicons' },
];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pendente: { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
  concluido: { bg: '#dcfce7', color: '#166534', label: 'Realizado' },
  atrasado: { bg: '#fee2e2', color: '#991b1b', label: 'Atrasado' },
};

function statusAtualizado(e: Evento): Evento['status'] {
  if (e.status === 'concluido') return 'concluido';
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(e.data); d.setHours(0, 0, 0, 0);
  return d < hoje ? 'atrasado' : 'pendente';
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AgendaScreen() {
  const router = useRouter();
  const { eventos, concluirEvento, removerEvento } = usePet();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const eventosComStatus = useMemo(() => eventos.map(e => ({ ...e, status: statusAtualizado(e) })), [eventos]);

  const eventosFiltrados = useMemo(() => {
    let lista = eventosComStatus;
    if (filtro === 'atrasado') lista = lista.filter(e => e.status === 'atrasado');
    else if (filtro !== 'todos') lista = lista.filter(e => e.tipo === filtro);
    return lista.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [eventosComStatus, filtro]);

  return (
    <View style={s.container}>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtroBar}
        contentContainerStyle={s.filtroContent}
      >
        {FILTROS.map(f => (
          <Pressable
            key={f.valor}
            style={[s.filtroBtn, filtro === f.valor && s.filtroBtnAtivo]}
            onPress={() => setFiltro(f.valor)}
          >
            <AppIcon
              name={f.icon}
              set={f.iconSet}
              size={14}
              color={filtro === f.valor ? C.white : C.text}
              style={{ marginRight: 5 }}
            />
            <Text style={[s.filtroText, filtro === f.valor && s.filtroTextAtivo]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={eventosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => {
          const t = TIPOS_EVENTO.find(x => x.valor === item.tipo);
          const sb = STATUS_BADGE[item.status];
          return (
            <View style={s.card}>
              {/* Linha principal */}
              <View style={s.cardRow}>
                <View style={[s.eventoIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                  <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={18} color={C.white} />
                </View>
                <View style={s.eventoInfo}>
                  <Text style={s.eventoTitulo}>{item.titulo}</Text>
                  <Text style={s.eventoData}>{formatarData(item.data)}</Text>
                </View>
              </View>

              {/* Badges + ações */}
              <View style={s.cardFooter}>
                <View style={s.badges}>
                  <View style={[s.badge, { backgroundColor: (t?.cor ?? C.g500) + '22' }]}>
                    <Text style={[s.badgeText, { color: t?.cor ?? C.g500 }]}>{t?.label}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: sb.bg }]}>
                    <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                  </View>
                </View>
                <View style={s.acoes}>
                  {item.status !== 'concluido' && (
                    <Pressable style={s.btnAcao} onPress={() => concluirEvento(item.id)}>
                      <Ionicons name="checkmark" size={14} color={C.g600} />
                      <Text style={[s.btnAcaoText, { color: C.g600 }]}>Ok</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[s.btnAcao, s.btnAcaoDanger]}
                    onPress={() => removerEvento(item.id)}
                  >
                    <Ionicons name="trash-outline" size={14} color={C.danger} />
                    <Text style={[s.btnAcaoText, { color: C.danger }]}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <AppIcon name="calendar-outline" set="Ionicons" size={40} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>Nenhum evento encontrado</Text>
            <Text style={s.emptySub}>Tente outro filtro ou adicione um novo evento</Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => router.push('/add-evento')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  filtroBar: { flexGrow: 0, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  filtroContent: { padding: 12, gap: 8 },
  filtroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filtroBtnAtivo: { backgroundColor: C.g800, borderColor: C.g800 },
  filtroText: { fontSize: 12, fontWeight: '600', color: C.text },
  filtroTextAtivo: { color: C.white },

  lista: { padding: 16, paddingBottom: 96, gap: 10 },

  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  eventoIcone: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 14, fontWeight: '600', color: C.text },
  eventoData: { fontSize: 12, color: C.muted, marginTop: 2 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.w50,
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  acoes: { flexDirection: 'row', gap: 6 },
  btnAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
  },
  btnAcaoDanger: { backgroundColor: '#fff5f5', borderColor: '#fecaca' },
  btnAcaoText: { fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.g600,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});