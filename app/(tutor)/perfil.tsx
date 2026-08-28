import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../context/PetContext';
import { ESPECIES } from '../../constants';
import { authService } from '../../services/authService';
import { AppIcon } from '../../components/AppIcon';
import type { Evento, StatusEventoExibicao } from '../../types';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

/** Mesma regra de exibição usada em todo o app do tutor. */
function statusExibicao(e: Evento): StatusEventoExibicao {
  if (e.status === 'concluido' || e.status === 'cancelado') return e.status;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(e.data); d.setHours(0, 0, 0, 0);
  return d < hoje ? 'atrasado' : e.status;
}

export default function PerfilScreen() {
  const router = useRouter();
  const {
    pets,
    petAtivo,
    petAtivoId,
    selecionarPet,
    removerPet,
    eventos,
    preferencias,
    atualizarPreferencias,
    resetar,
  } = usePet();

  const eventosComStatus = useMemo(
    () => eventos.map(e => ({ ...e, statusExibicao: statusExibicao(e) })),
    [eventos]
  );
  const total = eventosComStatus.length;
  const concluidos = eventosComStatus.filter(e => e.statusExibicao === 'concluido').length;
  const pendentes = eventosComStatus.filter(e => e.statusExibicao === 'solicitado' || e.statusExibicao === 'confirmado').length;
  const atrasados = eventosComStatus.filter(e => e.statusExibicao === 'atrasado').length;
  const especieInfo = ESPECIES.find(e => e.valor === petAtivo?.especie);

  function handleResetar() {
    Alert.alert(
      'Resetar todos os dados?',
      'Isso apaga todos os pets, eventos e recompensas cadastrados. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => resetar().then(() => router.replace('/onboarding')),
        },
      ]
    );
  }

  function handleSair() {
    Alert.alert('Sair da conta?', 'Você precisará entrar novamente para acessar seus pets e eventos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/onboarding');
        },
      },
    ]);
  }

  function handleRemoverPet(id: string, nome: string) {
    if (pets.length <= 1) {
      Alert.alert('Não é possível remover', 'Você precisa ter pelo menos 1 pet cadastrado.');
      return;
    }
    Alert.alert(
      `Remover ${nome}?`,
      'Os eventos de saúde e recompensas desse pet também serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removerPet(id) },
      ]
    );
  }

  const iniciais = petAtivo?.nome ? petAtivo.nome[0].toUpperCase() : '?';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Banner do usuário */}
      <View style={s.banner}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{iniciais}</Text>
        </View>
        <View style={s.bannerInfo}>
          <Text style={s.bannerNome}>{petAtivo?.nome ?? '–'}</Text>
          <Text style={s.bannerRole}>{especieInfo?.label ?? '–'}{petAtivo?.raca ? ` • ${petAtivo.raca}` : ''}</Text>
        </View>
        <View style={s.bannerStat}>
          <Text style={s.bannerStatVal}>{total}</Text>
          <Text style={s.bannerStatLbl}>eventos</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <StatCard valor={total} label="Total" accentColor={C.info} />
        <StatCard valor={concluidos} label="Realizados" accentColor={C.g500} />
        <StatCard valor={pendentes} label="Pendentes" accentColor={C.warn} />
        <StatCard valor={atrasados} label="Atrasados" accentColor={C.danger} />
      </View>

      {/* Meus Pets */}
      <View style={s.secLabelRow}>
        <Text style={s.secLabel}>Meus Pets</Text>
        <Text style={s.secLabelContagem}>{pets.length}</Text>
      </View>
      <View style={s.card}>
        {pets.map((p, i) => {
          const info = ESPECIES.find(e => e.valor === p.especie);
          const ativo = p.id === petAtivoId;
          return (
            <View key={p.id}>
              <Pressable style={s.petRow} onPress={() => selecionarPet(p.id)}>
                <View style={[s.petRowAvatar, ativo && s.petRowAvatarAtivo]}>
                  <AppIcon
                    name={info?.icon ?? 'paw'}
                    set={info?.iconSet ?? 'MaterialCommunityIcons'}
                    size={18}
                    color={ativo ? C.white : C.muted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.petRowNome}>{p.nome}</Text>
                  <Text style={s.petRowDetalhe}>{info?.label}{p.raca ? ` • ${p.raca}` : ''}</Text>
                </View>
                {ativo && (
                  <View style={s.petRowBadge}>
                    <Text style={s.petRowBadgeText}>Ativo</Text>
                  </View>
                )}
                <Pressable
                  style={s.petRowRemover}
                  onPress={() => handleRemoverPet(p.id, p.nome)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={16} color={C.danger} />
                </Pressable>
              </Pressable>
              {i < pets.length - 1 && <View style={s.divisor} />}
            </View>
          );
        })}
        <View style={s.divisor} />
        <Pressable style={s.btnAddPet} onPress={() => router.push('/add-pet')}>
          <Ionicons name="add-circle-outline" size={18} color={C.g600} />
          <Text style={s.btnAddPetText}>Adicionar novo pet</Text>
        </Pressable>
      </View>

      {/* Dados do pet ativo */}
      <Text style={s.secLabel}>Dados do Pet</Text>
      <View style={s.card}>
        {[
          ['Nome', petAtivo?.nome ?? '–'],
          ['Espécie', especieInfo?.label ?? '–'],
          ['Raça', petAtivo?.raca ?? '–'],
          ['Peso', petAtivo?.peso ? `${petAtivo.peso} kg` : '–'],
        ].map(([label, valor], i, arr) => (
          <View key={label}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValor}>{valor}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.divisor} />}
          </View>
        ))}
      </View>

      {/* Notificações */}
      <Text style={s.secLabel}>Notificações</Text>
      <View style={s.card}>
        <PrefSwitch
          label="Ativar notificações"
          desc="Receba lembretes de eventos"
          valor={preferencias.ativas ?? true}
          onToggle={v => atualizarPreferencias({ ...preferencias, ativas: v })}
        />
        <View style={s.divisor} />
        <PrefSwitch
          label="Lembrete 7 dias antes"
          desc="Aviso com antecedência"
          valor={preferencias.lembrete7 ?? true}
          onToggle={v => atualizarPreferencias({ ...preferencias, lembrete7: v })}
        />
        <View style={s.divisor} />
        <PrefSwitch
          label="Lembrete no dia anterior"
          desc="Aviso na véspera"
          valor={preferencias.lembreteAntes ?? true}
          onToggle={v => atualizarPreferencias({ ...preferencias, lembreteAntes: v })}
        />
      </View>

      {/* Sobre */}
      <Text style={s.secLabel}>Sobre</Text>
      <View style={s.card}>
        {[
          ['Aplicativo', 'ClyvoVet'],
          ['Versão', '1.0.0'],
          ['Desafio', 'FIAP Challenge 2026'],
          ['Expo SDK', '~54.0.0'],
        ].map(([label, valor], i, arr) => (
          <View key={label}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValor}>{valor}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.divisor} />}
          </View>
        ))}
      </View>

      {/* Sair */}
      <Pressable style={s.btnSair} onPress={handleSair}>
        <Ionicons name="log-out-outline" size={16} color={C.g700} />
        <Text style={s.btnSairText}>Sair da conta</Text>
      </Pressable>

      {/* Resetar */}
      <Pressable style={s.btnResetar} onPress={handleResetar}>
        <Ionicons name="trash-outline" size={16} color="#fff" />
        <Text style={s.btnResetarText}>Resetar todos os dados</Text>
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

function PrefSwitch({ label, desc, valor, onToggle }: { label: string; desc: string; valor: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={s.prefRow}>
      <View style={s.prefInfo}>
        <Text style={s.prefLabel}>{label}</Text>
        <Text style={s.prefDesc}>{desc}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onToggle}
        trackColor={{ false: C.border, true: C.g500 }}
        thumbColor={C.white}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 16, paddingBottom: 40 },

  banner: {
    backgroundColor: C.g900,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.g700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  bannerInfo: { flex: 1 },
  bannerNome: { fontSize: 15, fontWeight: '700', color: C.white },
  bannerRole: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  bannerStat: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10 },
  bannerStatVal: { fontSize: 20, fontWeight: '700', color: C.white },
  bannerStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 10,
    borderBottomWidth: 3,
  },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: C.muted, marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: '700', lineHeight: 24 },

  secLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.muted,
    marginBottom: 10,
    marginTop: 4,
    paddingLeft: 2,
  },
  secLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 2 },
  secLabelContagem: { fontSize: 11, fontWeight: '700', color: C.g600, marginBottom: 10 },

  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  divisor: { height: 1, backgroundColor: C.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
  infoLabel: { fontSize: 13, color: C.muted },
  infoValor: { fontSize: 13, fontWeight: '600', color: C.text },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  prefInfo: { flex: 1 },
  prefLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  prefDesc: { fontSize: 12, color: C.muted, marginTop: 2 },

  petRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  petRowAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.w50, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  petRowAvatarAtivo: { backgroundColor: C.g600, borderColor: C.g600 },
  petRowNome: { fontSize: 14, fontWeight: '700', color: C.text },
  petRowDetalhe: { fontSize: 11, color: C.muted, marginTop: 2 },
  petRowBadge: { backgroundColor: C.g100, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 },
  petRowBadgeText: { fontSize: 10, fontWeight: '700', color: C.g700 },
  petRowRemover: { padding: 4 },

  btnAddPet: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14,
  },
  btnAddPetText: { fontSize: 13, fontWeight: '700', color: C.g600 },

  btnSair: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  btnSairText: { color: C.g700, fontSize: 14, fontWeight: '700' },

  btnResetar: {
    backgroundColor: C.danger,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnResetarText: { color: C.white, fontSize: 14, fontWeight: '700' },
});