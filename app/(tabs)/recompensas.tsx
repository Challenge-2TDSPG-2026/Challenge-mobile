import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { usePet } from '../../context/PetContext';
import { AppIcon } from '../../components/AppIcon';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  ouro: '#c99a2e', ouroClaro: '#fdf6e3',
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RecompensasScreen() {
  const {
    pet,
    metaConsultas,
    consultasConcluidasTotal,
    consultasNoCicloAtual,
    recompensasDisponiveis,
    recompensas,
    resgatarRecompensa,
  } = usePet();

  const faltam = Math.max(0, metaConsultas - consultasNoCicloAtual);
  const pct = Math.min(100, Math.round((consultasNoCicloAtual / metaConsultas) * 100));
  const historico = recompensas.filter(r => r.resgatada).sort(
    (a, b) => new Date(b.resgatadaEm ?? b.criadaEm).getTime() - new Date(a.resgatadaEm ?? a.criadaEm).getTime()
  );

  function handleResgatar(id: string) {
    Alert.alert(
      'Resgatar consulta grátis?',
      `Essa consulta grátis será usada para ${pet?.nome ?? 'seu pet'}. Apresente esse resgate na clínica.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resgatar', onPress: () => resgatarRecompensa(id) },
      ]
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Banner principal */}
      <View style={s.banner}>
        <View style={s.bannerIconWrap}>
          <AppIcon name="gift-outline" set="Ionicons" size={30} color={C.white} />
        </View>
        <Text style={s.bannerTitulo}>Programa de Fidelidade</Text>
        <Text style={s.bannerSub}>
          A cada {metaConsultas} consultas concluídas, {pet?.nome ?? 'seu pet'} ganha 1 consulta grátis
        </Text>
      </View>

      {/* Progresso do ciclo atual */}
      <View style={s.progressoCard}>
        <View style={s.progressoHead}>
          <Text style={s.progressoLbl}>Progresso atual</Text>
          <Text style={s.progressoContagem}>{consultasNoCicloAtual}/{metaConsultas}</Text>
        </View>
        <View style={s.barraTrack}>
          <View style={[s.barraFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={s.progressoHint}>
          {faltam === 0
            ? 'Meta atingida! Confira seu cupom abaixo 🎉'
            : `Faltam ${faltam} consulta${faltam !== 1 ? 's' : ''} concluída${faltam !== 1 ? 's' : ''} para o próximo cupom`}
        </Text>

        {/* Selinhos de bolinhas representando cada consulta do ciclo */}
        <View style={s.dotsRow}>
          {Array.from({ length: metaConsultas }).map((_, i) => (
            <View
              key={i}
              style={[s.dotConsulta, i < consultasNoCicloAtual && s.dotConsultaPreenchida]}
            >
              {i < consultasNoCicloAtual && (
                <AppIcon name="checkmark" set="Ionicons" size={12} color={C.white} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Cupons disponíveis */}
      <Text style={s.secLabel}>Cupons disponíveis</Text>
      {recompensasDisponiveis.length === 0 ? (
        <View style={s.emptyCard}>
          <AppIcon name="ribbon-outline" set="Ionicons" size={32} color={C.muted} style={{ marginBottom: 8 }} />
          <Text style={s.emptyTitle}>Nenhum cupom por enquanto</Text>
          <Text style={s.emptySub}>Continue registrando consultas para desbloquear sua primeira consulta grátis</Text>
        </View>
      ) : (
        recompensasDisponiveis.map(r => (
          <View key={r.id} style={s.cupomCard}>
            <View style={s.cupomIconWrap}>
              <AppIcon name="gift" set="Ionicons" size={22} color={C.ouro} />
            </View>
            <View style={s.cupomInfo}>
              <Text style={s.cupomTitulo}>1 Consulta grátis</Text>
              <Text style={s.cupomSub}>Conquistado em {formatarData(r.criadaEm)}</Text>
            </View>
            <Pressable style={s.btnResgatar} onPress={() => handleResgatar(r.id)}>
              <Text style={s.btnResgatarText}>Resgatar</Text>
            </Pressable>
          </View>
        ))
      )}

      {/* Estatística geral */}
      <Text style={s.secLabel}>Estatísticas</Text>
      <View style={s.statsCard}>
        <View style={s.statItem}>
          <Text style={s.statValor}>{consultasConcluidasTotal}</Text>
          <Text style={s.statLabel}>Consultas realizadas</Text>
        </View>
        <View style={s.statDivisor} />
        <View style={s.statItem}>
          <Text style={s.statValor}>{recompensas.length}</Text>
          <Text style={s.statLabel}>Cupons conquistados</Text>
        </View>
        <View style={s.statDivisor} />
        <View style={s.statItem}>
          <Text style={s.statValor}>{historico.length}</Text>
          <Text style={s.statLabel}>Cupons resgatados</Text>
        </View>
      </View>

      {/* Histórico de resgates */}
      {historico.length > 0 && (
        <>
          <Text style={s.secLabel}>Histórico de resgates</Text>
          <View style={s.historicoCard}>
            {historico.map((r, idx) => (
              <View key={r.id} style={[s.historicoRow, idx < historico.length - 1 && s.historicoRowBorder]}>
                <AppIcon name="checkmark-circle" set="Ionicons" size={18} color={C.g500} />
                <View style={{ flex: 1 }}>
                  <Text style={s.historicoTitulo}>Consulta grátis resgatada</Text>
                  <Text style={s.historicoData}>
                    {r.resgatadaEm ? formatarData(r.resgatadaEm) : '—'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 16, paddingBottom: 40 },

  banner: {
    backgroundColor: C.g800,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitulo: { fontSize: 17, fontWeight: '700', color: C.white, marginBottom: 4 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 12 },

  progressoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 20,
  },
  progressoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressoLbl: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  progressoContagem: { fontSize: 18, fontWeight: '700', color: C.g700 },
  barraTrack: { height: 10, backgroundColor: C.w100, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  barraFill: { height: '100%', backgroundColor: C.g500, borderRadius: 5 },
  progressoHint: { fontSize: 12, color: C.muted, marginBottom: 14 },

  dotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dotConsulta: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.w50,
    justifyContent: 'center', alignItems: 'center',
  },
  dotConsultaPreenchida: { backgroundColor: C.g500, borderColor: C.g500 },

  secLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    color: C.muted, marginBottom: 10, marginTop: 4, paddingLeft: 2,
  },

  emptyCard: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    padding: 24, alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: C.muted, textAlign: 'center' },

  cupomCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.ouroClaro, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.ouro,
    padding: 14, marginBottom: 10,
  },
  cupomIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.ouro,
  },
  cupomInfo: { flex: 1 },
  cupomTitulo: { fontSize: 14, fontWeight: '700', color: C.text },
  cupomSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  btnResgatar: {
    backgroundColor: C.ouro, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
  },
  btnResgatarText: { color: C.white, fontSize: 12, fontWeight: '700' },

  statsCard: {
    flexDirection: 'row', backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, marginBottom: 20, overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValor: { fontSize: 22, fontWeight: '700', color: C.g700 },
  statLabel: { fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: 4 },
  statDivisor: { width: 1, backgroundColor: C.border },

  historicoCard: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  historicoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  historicoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  historicoTitulo: { fontSize: 13, fontWeight: '600', color: C.text },
  historicoData: { fontSize: 11, color: C.muted, marginTop: 2 },
});