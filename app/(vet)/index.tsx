import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVet } from '../../context/VetContext';
import { TIPOS_EVENTO, STATUS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function VetDashboardScreen() {
  const router = useRouter();
  const { veterinarioAtivo, veterinarioAtivoId, pets, eventosDeHoje, eventosSolicitados, confirmarEvento } = useVet();

  const confirmadasHoje = useMemo(
    () => eventosDeHoje.filter(e => e.status === 'confirmado' && e.veterinarioId === veterinarioAtivoId).length,
    [eventosDeHoje, veterinarioAtivoId]
  );
  const concluidasHoje = useMemo(
    () => eventosDeHoje.filter(e => e.status === 'concluido').length,
    [eventosDeHoje]
  );

  function nomePet(petId: string): string {
    return pets.find(p => p.id === petId)?.nome ?? 'Pet não identificado';
  }

  if (!veterinarioAtivo) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Welcome banner */}
      <View style={s.welcome}>
        <AppIcon name="medical-bag" set="MaterialCommunityIcons" size={34} color={C.white} />
        <View style={s.welcomeInfo}>
          <Text style={s.welcomeNome}>Olá, {veterinarioAtivo.nome}</Text>
          <Text style={s.welcomeSub}>{veterinarioAtivo.especialidade} • {veterinarioAtivo.clinica}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard valor={eventosSolicitados.length} label="Na fila" accentColor={C.warn} />
        <StatCard valor={confirmadasHoje} label="Confirmadas hoje" accentColor={C.info} />
        <StatCard valor={concluidasHoje} label="Concluídas hoje" accentColor={C.g500} />
      </View>

      {/* Atalhos rápidos */}
      <View style={s.atalhosRow}>
        <Pressable style={s.atalho} onPress={() => router.push('/(vet)/consultas')}>
          <AppIcon name="checkmark-done-circle-outline" set="Ionicons" size={20} color={C.g600} />
          <Text style={s.atalhoText}>Confirmar consultas</Text>
        </Pressable>
        <Pressable style={s.atalho} onPress={() => router.push('/(vet)/pacientes')}>
          <AppIcon name="folder-outline" set="Ionicons" size={20} color={C.g600} />
          <Text style={s.atalhoText}>Ver prontuários</Text>
        </Pressable>
      </View>

      {/* Atendimentos de hoje */}
      <View style={s.card}>
        <View style={s.cardHead}>
          <Text style={s.cardTitle}>Atendimentos de Hoje</Text>
          <Pressable onPress={() => router.push('/(vet)/consultas')}>
            <Text style={s.linkVer}>Ver todos</Text>
          </Pressable>
        </View>

        {eventosDeHoje.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="calendar-outline" set="Ionicons" size={36} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>Nenhum atendimento hoje</Text>
            <Text style={s.emptySub}>A agenda do dia está livre</Text>
          </View>
        ) : (
          eventosDeHoje.map((e, idx) => {
            const t = TIPOS_EVENTO.find(x => x.valor === e.tipo);
            const sb = STATUS_EVENTO[e.status];
            const isLast = idx === eventosDeHoje.length - 1;
            return (
              <View key={e.id} style={[s.eventoRow, !isLast && s.eventoRowBorder]}>
                <View style={[s.eventoIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                  <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={16} color={C.white} />
                </View>
                <View style={s.eventoInfo}>
                  <Text style={s.eventoTitulo}>{e.titulo}</Text>
                  <Text style={s.eventoMeta}>{formatarHora(e.data)} • {nomePet(e.petId)}</Text>
                </View>
                {e.status === 'solicitado' ? (
                  <Pressable style={s.btnConfirmar} onPress={() => confirmarEvento(e.id)}>
                    <Text style={s.btnConfirmarText}>Confirmar</Text>
                  </Pressable>
                ) : (
                  <View style={[s.badge, { backgroundColor: sb.bg }]}>
                    <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );
}

function StatCard({ valor, label, accentColor }: { valor: number; label: string; accentColor: string }) {
  return (
    <View style={[s.statCard, { borderBottomColor: accentColor }]}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statVal, { color: accentColor }]}>{valor}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 20, paddingBottom: 32 },

  welcome: {
    backgroundColor: C.g800,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  welcomeInfo: { flex: 1 },
  welcomeNome: { fontSize: 18, fontWeight: '700', color: C.white, letterSpacing: -0.3 },
  welcomeSub: { fontSize: 12, color: 'rgba(168,230,199,0.85)', marginTop: 3 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    borderBottomWidth: 3,
  },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: C.muted, marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: '700', lineHeight: 28 },

  atalhosRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  atalho: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
  },
  atalhoText: { fontSize: 12, fontWeight: '700', color: C.text, flexShrink: 1 },

  card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  cardHead: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.w50,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  linkVer: { fontSize: 13, color: C.g600, fontWeight: '600' },

  eventoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  eventoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  eventoIcone: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 13, fontWeight: '600', color: C.text },
  eventoMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  btnConfirmar: {
    backgroundColor: C.g600,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnConfirmarText: { color: C.white, fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: { marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: C.muted },
});