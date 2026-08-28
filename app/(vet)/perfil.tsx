import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVet } from '../../context/VetContext';
import { authService } from '../../services/authService';
import { AppIcon } from '../../components/AppIcon';
import { alertar } from '../../utils/alert';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g200: '#a8e6c7', g100: '#d4f2e4',
  cream: '#fafaf8', w50: '#f9f7f4',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', info: '#2563eb',
};

export default function VetPerfilScreen() {
  const router = useRouter();
  const { veterinarioAtivo, veterinarioAtivoId, pacientes, eventos } = useVet();

  const consultasConcluidas = useMemo(
    () => eventos.filter(e => e.status === 'concluido' && e.veterinarioId === veterinarioAtivoId).length,
    [eventos, veterinarioAtivoId]
  );

  const consultasConfirmadas = useMemo(
    () => eventos.filter(e => e.status === 'confirmado' && e.veterinarioId === veterinarioAtivoId).length,
    [eventos, veterinarioAtivoId]
  );

  function handleSair() {
    alertar('Sair da conta?', 'Você precisará entrar novamente para acessar o portal do veterinário.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/vet-auth');
        },
      },
    ]);
  }

  const iniciais = veterinarioAtivo?.nome ? veterinarioAtivo.nome[0].toUpperCase() : '?';

  if (!veterinarioAtivo) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Banner */}
      <View style={s.banner}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{iniciais}</Text>
        </View>
        <View style={s.bannerInfo}>
          <Text style={s.bannerNome}>{veterinarioAtivo.nome}</Text>
          <Text style={s.bannerRole}>{veterinarioAtivo.especialidade} • CRMV {veterinarioAtivo.crmv}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard valor={pacientes.length} label="Pacientes" accentColor={C.info} />
        <StatCard valor={consultasConfirmadas} label="Confirmadas" accentColor={C.g500} />
        <StatCard valor={consultasConcluidas} label="Concluídas" accentColor={C.g700} />
      </View>

      {/* Dados profissionais */}
      <Text style={s.secLabel}>Dados Profissionais</Text>
      <View style={s.card}>
        {[
          ['Nome', veterinarioAtivo.nome],
          ['CRMV', veterinarioAtivo.crmv],
          ['Especialidade', veterinarioAtivo.especialidade],
          ['Clínica', veterinarioAtivo.clinica],
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

      {/* Sobre */}
      <Text style={s.secLabel}>Sobre</Text>
      <View style={s.card}>
        {[
          ['Aplicativo', 'ClyvoVet — Portal do Veterinário'],
          ['Versão', '1.0.0'],
          ['Desafio', 'FIAP Challenge 2026'],
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
        <Ionicons name="log-out-outline" size={16} color="#fff" />
        <Text style={s.btnSairText}>Sair da conta</Text>
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
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.g700, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  bannerInfo: { flex: 1 },
  bannerNome: { fontSize: 15, fontWeight: '700', color: C.white },
  bannerRole: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 10, borderBottomWidth: 3,
  },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: C.muted, marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: '700', lineHeight: 24 },

  secLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    color: C.muted, marginBottom: 10, marginTop: 4, paddingLeft: 2,
  },

  card: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, marginBottom: 20, overflow: 'hidden',
  },
  divisor: { height: 1, backgroundColor: C.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
  infoLabel: { fontSize: 13, color: C.muted },
  infoValor: { fontSize: 13, fontWeight: '600', color: C.text },

  btnSair: {
    backgroundColor: C.danger,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnSairText: { color: C.white, fontSize: 14, fontWeight: '700' },
});