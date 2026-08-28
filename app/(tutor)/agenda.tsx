import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../context/PetContext';
import { TIPOS_EVENTO, STATUS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import { PetSwitcher } from '../../components/PetSwitcher';
import { Calendario, dateKey } from '../../components/Calendario';
import { alertar } from '../../utils/alert';
import type { Evento, StatusEventoExibicao } from '../../types';

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

/**
 * Status de EXIBIÇÃO do evento (mesma regra usada no PetContext):
 * 'atrasado' é calculado, nunca persistido, e só se aplica a eventos
 * ainda em aberto ('solicitado'/'confirmado') com data no passado.
 */
function statusExibicao(e: Evento): StatusEventoExibicao {
  if (e.status === 'concluido' || e.status === 'cancelado') return e.status;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(e.data); d.setHours(0, 0, 0, 0);
  return d < hoje ? 'atrasado' : e.status;
}

function formatarDataLonga(d: Date): string {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function AgendaScreen() {
  const router = useRouter();
  const { petAtivo, eventos, removerEvento } = usePet();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [mesRef, setMesRef] = useState(() => new Date());
  const [selecionado, setSelecionado] = useState(() => new Date());

  const eventosComStatus = useMemo(
    () => eventos.map(e => ({ ...e, statusExibicao: statusExibicao(e) })),
    [eventos]
  );

  const eventosFiltrados = useMemo(() => {
    if (filtro === 'atrasado') return eventosComStatus.filter(e => e.statusExibicao === 'atrasado');
    if (filtro !== 'todos') return eventosComStatus.filter(e => e.tipo === filtro);
    return eventosComStatus;
  }, [eventosComStatus, filtro]);

  const marcadores = useMemo(() => {
    const mapa: Record<string, string[]> = {};
    for (const e of eventosFiltrados) {
      const chave = dateKey(new Date(e.data));
      const t = TIPOS_EVENTO.find(x => x.valor === e.tipo);
      const cor = t?.cor ?? C.g500;
      if (!mapa[chave]) mapa[chave] = [];
      if (!mapa[chave].includes(cor)) mapa[chave].push(cor);
    }
    return mapa;
  }, [eventosFiltrados]);

  const eventosDoDia = useMemo(() => {
    const chaveSelecionada = dateKey(selecionado);
    return eventosFiltrados
      .filter(e => dateKey(new Date(e.data)) === chaveSelecionada)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [eventosFiltrados, selecionado]);

  function handleMudarMes(offset: number) {
    setMesRef(atual => {
      const novo = new Date(atual.getFullYear(), atual.getMonth() + offset, 1);
      setSelecionado(novo);
      return novo;
    });
  }

  function handleRemover(id: string) {
    alertar(
      'Retirar solicitação?',
      'Isso cancela o pedido antes mesmo do veterinário confirmar. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Retirar', style: 'destructive', onPress: () => removerEvento(id) },
      ]
    );
  }

  return (
    <View style={s.container}>

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

      <ScrollView contentContainerStyle={s.scrollContent}>

        <PetSwitcher />

        <Calendario
          mesRef={mesRef}
          selecionado={selecionado}
          marcadores={marcadores}
          onSelecionar={setSelecionado}
          onMudarMes={handleMudarMes}
        />

        <View style={s.diaHeader}>
          <Text style={s.diaHeaderTexto}>{formatarDataLonga(selecionado)}</Text>
          {eventosDoDia.length > 0 && (
            <View style={s.diaHeaderBadge}>
              <Text style={s.diaHeaderBadgeText}>{eventosDoDia.length}</Text>
            </View>
          )}
        </View>

        {eventosDoDia.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="calendar-outline" set="Ionicons" size={40} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>Nenhum exame nesse dia</Text>
            <Text style={s.emptySub}>Toque em outra data ou solicite um novo evento</Text>
          </View>
        ) : (
          eventosDoDia.map(item => {
            const t = TIPOS_EVENTO.find(x => x.valor === item.tipo);
            const sb = STATUS_EVENTO[item.statusExibicao];
            const podeRetirar = item.status === 'solicitado';
            return (
              <View key={item.id} style={s.card}>
                <View style={s.cardRow}>
                  <View style={[s.eventoIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                    <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={18} color={C.white} />
                  </View>
                  <View style={s.eventoInfo}>
                    <Text style={s.eventoTitulo}>{item.titulo}</Text>
                    <View style={s.eventoMetaRow}>
                      <AppIcon name="time-outline" set="Ionicons" size={11} color={C.muted} />
                      <Text style={s.eventoMeta}>{formatarHora(item.data)}</Text>
                      <Text style={s.eventoMetaDot}>•</Text>
                      <AppIcon name="paw" set="MaterialCommunityIcons" size={11} color={C.muted} />
                      <Text style={s.eventoMeta}>{petAtivo?.nome ?? 'Pet não identificado'}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.cardFooter}>
                  <View style={s.badges}>
                    <View style={[s.badge, { backgroundColor: (t?.cor ?? C.g500) + '22' }]}>
                      <Text style={[s.badgeText, { color: t?.cor ?? C.g500 }]}>{t?.label}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: sb.bg }]}>
                      <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                    </View>
                  </View>
                  {podeRetirar && (
                    <Pressable
                      style={[s.btnAcao, s.btnAcaoDanger]}
                      onPress={() => handleRemover(item.id)}
                    >
                      <Ionicons name="close-circle-outline" size={14} color={C.danger} />
                      <Text style={[s.btnAcaoText, { color: C.danger }]}>Retirar</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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

  scrollContent: { padding: 16, paddingBottom: 96 },

  diaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12, paddingHorizontal: 2,
  },
  diaHeaderTexto: { fontSize: 14, fontWeight: '700', color: C.text, textTransform: 'capitalize', flex: 1 },
  diaHeaderBadge: {
    backgroundColor: C.g100, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: C.g200,
  },
  diaHeaderBadgeText: { fontSize: 11, fontWeight: '700', color: C.g700 },

  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
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
  eventoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  eventoMeta: { fontSize: 11, color: C.muted },
  eventoMetaDot: { fontSize: 11, color: C.muted, marginHorizontal: 2 },

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

  empty: { alignItems: 'center', paddingVertical: 48 },
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