import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../context/PetContext';
import { CORES, ESPECIES, TIPOS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import type { Evento } from '../../types';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5', w200: '#e0d8ce',
  w400: '#b8a99a', w800: '#3d3028',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', dangerLight: '#fff5f5', warn: '#e67e22', info: '#2563eb',
};

function calcularIdade(d: string): string {
  const nasc = new Date(d), hoje = new Date();
  const meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
  if (meses < 1) return 'Menos de 1 mês';
  if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  const a = Math.floor(meses / 12), m = meses % 12;
  return m > 0 ? `${a} ano${a > 1 ? 's' : ''} e ${m} mês${m > 1 ? 'es' : ''}` : `${a} ano${a > 1 ? 's' : ''}`;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusAtualizado(e: Evento): Evento['status'] {
  if (e.status === 'concluido') return 'concluido';
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(e.data); d.setHours(0, 0, 0, 0);
  return d < hoje ? 'atrasado' : 'pendente';
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pendente: { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
  concluido: { bg: '#dcfce7', color: '#166534', label: 'Realizado' },
  atrasado: { bg: '#fee2e2', color: '#991b1b', label: 'Atrasado' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const { pet, eventos } = usePet();

  const eventosComStatus = useMemo(() => eventos.map(e => ({ ...e, status: statusAtualizado(e) })), [eventos]);
  const pendentes = eventosComStatus.filter(e => e.status === 'pendente');
  const concluidos = eventosComStatus.filter(e => e.status === 'concluido');
  const atrasados = eventosComStatus.filter(e => e.status === 'atrasado');
  const proximos = [...pendentes, ...atrasados]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);
  const especieInfo = ESPECIES.find(e => e.valor === pet?.especie);

  if (!pet) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Welcome banner */}
      <View style={s.welcome}>
        <AppIcon
          name={especieInfo?.icon ?? 'paw'}
          set={especieInfo?.iconSet ?? 'MaterialCommunityIcons'}
          size={36}
          color={C.white}
        />
        <View style={s.welcomeInfo}>
          <Text style={s.welcomeNome}>Olá, {pet.nome}!</Text>
          <Text style={s.welcomeSub}>Gerencie a saúde do seu pet em um só lugar.</Text>
        </View>
        <Pressable style={s.welcomeBtn} onPress={() => router.push('/add-evento')}>
          <Text style={s.welcomeBtnText}>+ Evento</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard valor={pendentes.length} label="Pendentes" accentColor={C.warn} />
        <StatCard valor={concluidos.length} label="Realizados" accentColor={C.g500} />
        <StatCard valor={atrasados.length} label="Atrasados" accentColor={C.danger} />
      </View>

      {/* Pet card */}
      <View style={s.card}>
        <View style={s.cardHead}>
          <Text style={s.cardTitle}>Meu Pet — Visão Geral</Text>
        </View>
        <View style={s.petRow}>
          <View style={s.petAvatar}>
            <AppIcon
              name={especieInfo?.icon ?? 'paw'}
              set={especieInfo?.iconSet ?? 'MaterialCommunityIcons'}
              size={22}
              color={C.g600}
            />
          </View>
          <View style={s.petInfo}>
            <Text style={s.petNome}>{pet.nome}</Text>
            <Text style={s.petDetalhe}>{pet.especie}{pet.raca ? ` • ${pet.raca}` : ''}</Text>
            <Text style={s.petDetalhe}>Idade: {calcularIdade(pet.dataNascimento)}</Text>
            <Text style={s.petDetalhe}>Peso: {pet.peso ? `${pet.peso} kg` : '—'}</Text>
          </View>
          <Pressable style={s.btnProntuario} onPress={() => router.push('/(tabs)/agenda')}>
            <AppIcon name="pulse-outline" set="Ionicons" size={14} color={C.text} style={{ marginRight: 4 }} />
            <Text style={s.btnProntuarioText}>Agenda</Text>
          </Pressable>
        </View>
      </View>

      {/* Próximos eventos */}
      <View style={s.card}>
        <View style={s.cardHead}>
          <Text style={s.cardTitle}>Próximos Eventos</Text>
          <Pressable onPress={() => router.push('/(tabs)/agenda')}>
            <Text style={s.linkVer}>Ver todos</Text>
          </Pressable>
        </View>

        {proximos.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="calendar-outline" set="Ionicons" size={36} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>Nenhum evento pendente</Text>
            <Text style={s.emptySub}>Adicione eventos de saúde para o seu pet</Text>
          </View>
        ) : (
          proximos.map((e, idx) => {
            const t = TIPOS_EVENTO.find(x => x.valor === e.tipo);
            const sb = STATUS_BADGE[e.status];
            const isLast = idx === proximos.length - 1;
            return (
              <View key={e.id} style={[s.eventoRow, !isLast && s.eventoRowBorder]}>
                <View style={[s.eventoIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                  <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={16} color={C.white} />
                </View>
                <View style={s.eventoInfo}>
                  <Text style={s.eventoTitulo}>{e.titulo}</Text>
                  <Text style={s.eventoData}>{formatarData(e.data)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: sb.bg }]}>
                  <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* CTA button */}
      <Pressable style={s.btnAdd} onPress={() => router.push('/add-evento')}>
        <Ionicons name="add-circle-outline" size={18} color="#fff" />
        <Text style={s.btnAddText}>Adicionar evento de saúde</Text>
      </Pressable>

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
  welcomeBtn: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  welcomeBtnText: { color: C.white, fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
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
  statVal: { fontSize: 28, fontWeight: '700', lineHeight: 30 },

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

  petRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.g100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: { flex: 1 },
  petNome: { fontSize: 15, fontWeight: '700', color: C.text },
  petDetalhe: { fontSize: 12, color: C.muted, marginTop: 2 },
  btnProntuario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  btnProntuarioText: { fontSize: 12, fontWeight: '600', color: C.text },

  eventoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  eventoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  eventoIcone: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 13, fontWeight: '600', color: C.text },
  eventoData: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: { marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: C.muted },

  btnAdd: {
    backgroundColor: C.g600,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnAddText: { color: C.white, fontSize: 14, fontWeight: '700' },
});