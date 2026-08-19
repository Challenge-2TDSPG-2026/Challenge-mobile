import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { usePet } from '../../context/PetContext';
import { TIPOS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import type { Evento } from '../../types';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

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

function mesAno(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function formatarDataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function HistoricoScreen() {
  const { eventos } = usePet();

  const eventosComStatus = useMemo(() => eventos.map(e => ({ ...e, status: statusAtualizado(e) })), [eventos]);
  const total = eventosComStatus.length;
  const concluidos = eventosComStatus.filter(e => e.status === 'concluido').length;
  const progresso = total > 0 ? concluidos / total : 0;

  const agrupados = useMemo(() => {
    const mapa: Record<string, typeof eventosComStatus> = {};
    const ordenados = [...eventosComStatus].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    for (const e of ordenados) {
      const chave = mesAno(e.data);
      if (!mapa[chave]) mapa[chave] = [];
      mapa[chave].push(e);
    }
    return mapa;
  }, [eventosComStatus]);

  const pct = Math.round(progresso * 100);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Stat cards row */}
      <View style={s.statsRow}>
        <StatCard valor={total} label="Total" accentColor={C.info} />
        <StatCard valor={concluidos} label="Realizados" accentColor={C.g500} />
        <StatCard valor={total - concluidos} label="Pendentes" accentColor={C.warn} />
      </View>

      {/* Progresso card */}
      <View style={s.progressoCard}>
        <View style={s.progressoHead}>
          <View>
            <Text style={s.progressoLbl}>Taxa de conclusão</Text>
            <Text style={s.progressoPct}>{pct}%</Text>
          </View>
          <View style={s.progressoMeta}>
            <Text style={s.progressoMetaText}>{concluidos} realizados</Text>
            <Text style={s.progressoMetaText}>{total - concluidos} pendentes</Text>
          </View>
        </View>
        <View style={s.barraTrack}>
          <View style={[s.barraFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={s.progressoHint}>{total} evento{total !== 1 ? 's' : ''} no total</Text>
      </View>

      {/* Timeline */}
      {Object.keys(agrupados).length === 0 ? (
        <View style={s.empty}>
          <AppIcon name="document-text-outline" set="Ionicons" size={40} color={C.muted} style={s.emptyIcon} />
          <Text style={s.emptyTitle}>Nenhum evento registrado ainda</Text>
          <Text style={s.emptySub}>Adicione eventos para ver o histórico clínico</Text>
        </View>
      ) : (
        Object.entries(agrupados).map(([mes, evts]) => (
          <View key={mes} style={s.grupo}>
            <View style={s.mesRow}>
              <Text style={s.mesTitulo}>{mes}</Text>
              <View style={s.mesBadge}>
                <Text style={s.mesBadgeText}>{evts.length}</Text>
              </View>
            </View>

            {/* Tabela */}
            <View style={s.tabelaCard}>
              <View style={s.tabelaHead}>
                <Text style={[s.thText, { flex: 2 }]}>Evento</Text>
                <Text style={[s.thText, { flex: 1, textAlign: 'center' }]}>Data</Text>
                <Text style={[s.thText, { flex: 1, textAlign: 'right' }]}>Status</Text>
              </View>
              {evts.map((evento, idx) => {
                const t = TIPOS_EVENTO.find(x => x.valor === evento.tipo);
                const sb = STATUS_BADGE[evento.status];
                const isLast = idx === evts.length - 1;
                return (
                  <View key={evento.id} style={[s.tabelaRow, !isLast && s.tabelaRowBorder]}>
                    {/* Evento */}
                    <View style={[s.tdEvento, { flex: 2 }]}>
                      <View style={[s.rowIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                        <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={13} color={C.white} />
                      </View>
                      <View>
                        <Text style={s.rowTitulo} numberOfLines={1}>{evento.titulo}</Text>
                        <View style={[s.tipoBadge, { backgroundColor: (t?.cor ?? C.g500) + '22' }]}>
                          <Text style={[s.tipoBadgeText, { color: t?.cor ?? C.g500 }]}>{t?.label}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Data */}
                    <Text style={[s.tdData, { flex: 1 }]}>{formatarDataCurta(evento.data)}</Text>

                    {/* Status */}
                    <View style={[s.tdStatus, { flex: 1 }]}>
                      <View style={[s.statusBadge, { backgroundColor: sb.bg }]}>
                        <Text style={[s.statusText, { color: sb.color }]}>{sb.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
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
  content: { padding: 16, paddingBottom: 32 },

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

  progressoCard: { backgroundColor: C.g800, borderRadius: 16, padding: 20, marginBottom: 24 },
  progressoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  progressoLbl: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(168,230,199,0.8)', marginBottom: 4 },
  progressoPct: { fontSize: 36, fontWeight: '700', color: C.white, lineHeight: 40 },
  progressoMeta: { alignItems: 'flex-end', gap: 4 },
  progressoMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  barraTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  barraFill: { height: '100%', backgroundColor: C.g400, borderRadius: 4 },
  progressoHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },

  grupo: { marginBottom: 22 },
  mesRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  mesTitulo: { fontSize: 13, fontWeight: '700', color: C.text, textTransform: 'capitalize', flex: 1 },
  mesBadge: { backgroundColor: C.w100, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  mesBadgeText: { fontSize: 11, fontWeight: '700', color: C.muted },

  tabelaCard: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  tabelaHead: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.w50,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  thText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: C.muted },
  tabelaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  tabelaRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },

  tdEvento: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcone: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  rowTitulo: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 3 },
  tipoBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
  tipoBadgeText: { fontSize: 10, fontWeight: '700' },

  tdData: { fontSize: 12, fontWeight: '600', color: C.muted, textAlign: 'center' },
  tdStatus: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
});