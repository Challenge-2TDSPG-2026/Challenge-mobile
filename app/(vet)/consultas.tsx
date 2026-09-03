import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useVet } from '../../context/VetContext';
import { obterVisualTipoEvento } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import { STATUS_EXIBICAO_BADGE, formatarDataHoraEvento, statusExibicao } from '../../utils/eventoStatus';
import { alertar } from '../../utils/alert';

const C = {
  g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52', g500: '#22a06b', g50: '#edfaf3', g200: '#a8e6c7',
  cream: '#fafaf8', w50: '#f9f7f4', text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

type Filtro = 'solicitados' | 'confirmados';

export default function ConsultasScreen() {
  const router = useRouter();
  const { eventosSolicitados, eventosConfirmados, confirmarEvento, carregando } = useVet();
  const [filtro, setFiltro] = useState<Filtro>('solicitados');
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const lista = filtro === 'solicitados' ? eventosSolicitados : eventosConfirmados;
  const listaOrdenada = [...lista].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  async function handleConfirmar(id: string) {
    setConfirmandoId(id);
    try {
      await confirmarEvento(id);
    } catch {
      alertar('Não foi possível confirmar', 'Tente novamente em instantes.');
    } finally {
      setConfirmandoId(null);
    }
  }

  return (
    <View style={s.container}>
      <View style={s.filtroBar}>
        <Pressable style={[s.filtroBtn, filtro === 'solicitados' && s.filtroBtnAtivo]} onPress={() => setFiltro('solicitados')}>
          <Text style={[s.filtroText, filtro === 'solicitados' && s.filtroTextAtivo]}>
            Aguardando ({eventosSolicitados.length})
          </Text>
        </Pressable>
        <Pressable style={[s.filtroBtn, filtro === 'confirmados' && s.filtroBtnAtivo]} onPress={() => setFiltro('confirmados')}>
          <Text style={[s.filtroText, filtro === 'confirmados' && s.filtroTextAtivo]}>
            Confirmados ({eventosConfirmados.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {carregando ? (
          <View style={s.empty}><ActivityIndicator color={C.g600} /></View>
        ) : listaOrdenada.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="checkmark-done-outline" set="Ionicons" size={40} color={C.muted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>Nada por aqui</Text>
            <Text style={s.emptySub}>
              {filtro === 'solicitados' ? 'Nenhuma solicitação aguardando confirmação.' : 'Nenhum atendimento confirmado no momento.'}
            </Text>
          </View>
        ) : (
          listaOrdenada.map(item => {
            const visual = obterVisualTipoEvento(item.nomeTipoEvento);
            const sb = STATUS_EXIBICAO_BADGE[statusExibicao(item)];
            return (
              <View key={item.id} style={s.card}>
                <Pressable style={s.cardRow} onPress={() => router.push(`/paciente/${item.petId}`)}>
                  <View style={[s.eventoIcone, { backgroundColor: visual.cor }]}>
                    <AppIcon name={visual.icon} set={visual.iconSet} size={18} color={C.white} />
                  </View>
                  <View style={s.eventoInfo}>
                    <Text style={s.eventoTitulo}>{item.nomeTipoEvento}</Text>
                    <Text style={s.eventoMeta}>{formatarDataHoraEvento(item.data)}</Text>
                    {item.observacao ? <Text style={s.eventoObs} numberOfLines={2}>{item.observacao}</Text> : null}
                  </View>
                </Pressable>
                <View style={s.cardFooter}>
                  <View style={[s.badge, { backgroundColor: sb.bg }]}>
                    <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                  </View>
                  {filtro === 'solicitados' ? (
                    <Pressable
                      style={s.btnConfirmar}
                      onPress={() => handleConfirmar(item.id)}
                      disabled={confirmandoId === item.id}
                    >
                      {confirmandoId === item.id ? (
                        <ActivityIndicator size="small" color={C.white} />
                      ) : (
                        <Text style={s.btnConfirmarText}>Confirmar</Text>
                      )}
                    </Pressable>
                  ) : (
                    <Pressable style={s.btnFicha} onPress={() => router.push(`/paciente/${item.petId}`)}>
                      <Text style={s.btnFichaText}>Ver ficha</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  filtroBar: { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, padding: 10, gap: 8 },
  filtroBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: C.w50, borderWidth: 1.5, borderColor: C.border },
  filtroBtnAtivo: { backgroundColor: C.g800, borderColor: C.g800 },
  filtroText: { fontSize: 12, fontWeight: '700', color: C.text },
  filtroTextAtivo: { color: C.white },

  content: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },

  card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  eventoIcone: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 14, fontWeight: '700', color: C.text },
  eventoMeta: { fontSize: 11, color: C.muted, marginTop: 3 },
  eventoObs: { fontSize: 11, color: C.muted, marginTop: 4, fontStyle: 'italic' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.w50 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  btnConfirmar: { backgroundColor: C.g600, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, minWidth: 84, alignItems: 'center' },
  btnConfirmarText: { color: C.white, fontSize: 12, fontWeight: '700' },
  btnFicha: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: C.border },
  btnFichaText: { color: C.text, fontSize: 12, fontWeight: '600' },
});