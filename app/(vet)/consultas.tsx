import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { useVet } from '../../context/VetContext';
import { TIPOS_EVENTO, STATUS_EVENTO } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import { alertar } from '../../utils/alert';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22', info: '#2563eb',
};

type Filtro = 'solicitadas' | 'confirmadas';
type ModalTipo = 'concluir' | 'cancelar' | null;

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function VetConsultasScreen() {
  const { pets, eventosSolicitados, eventosConfirmados, confirmarEvento, concluirEvento, cancelarEvento } = useVet();
  const [filtro, setFiltro] = useState<Filtro>('solicitadas');

  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);
  const [textoModal, setTextoModal] = useState('');

  const solicitadasOrdenadas = useMemo(
    () => [...eventosSolicitados].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    [eventosSolicitados]
  );
  const confirmadasOrdenadas = useMemo(
    () => [...eventosConfirmados].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    [eventosConfirmados]
  );

  const lista = filtro === 'solicitadas' ? solicitadasOrdenadas : confirmadasOrdenadas;

  function nomePet(petId: string): string {
    return pets.find(p => p.id === petId)?.nome ?? 'Pet não identificado';
  }

  function abrirModal(tipo: ModalTipo, eventoId: string) {
    setModalTipo(tipo);
    setEventoSelecionadoId(eventoId);
    setTextoModal('');
  }

  function fecharModal() {
    setModalTipo(null);
    setEventoSelecionadoId(null);
    setTextoModal('');
  }

  async function handleConfirmarModal() {
    if (!eventoSelecionadoId) return;

    if (modalTipo === 'cancelar' && !textoModal.trim()) {
      alertar('Motivo obrigatório', 'Informe o motivo do cancelamento antes de continuar.');
      return;
    }

    if (modalTipo === 'concluir') {
      await concluirEvento(eventoSelecionadoId, textoModal.trim() || undefined);
    } else if (modalTipo === 'cancelar') {
      await cancelarEvento(eventoSelecionadoId, textoModal.trim());
    }
    fecharModal();
  }

  return (
    <View style={s.container}>

      <View style={s.filtroBar}>
        <Pressable
          style={[s.filtroBtn, filtro === 'solicitadas' && s.filtroBtnAtivo]}
          onPress={() => setFiltro('solicitadas')}
        >
          <Text style={[s.filtroText, filtro === 'solicitadas' && s.filtroTextAtivo]}>
            Solicitadas ({solicitadasOrdenadas.length})
          </Text>
        </Pressable>
        <Pressable
          style={[s.filtroBtn, filtro === 'confirmadas' && s.filtroBtnAtivo]}
          onPress={() => setFiltro('confirmadas')}
        >
          <Text style={[s.filtroText, filtro === 'confirmadas' && s.filtroTextAtivo]}>
            Confirmadas ({confirmadasOrdenadas.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {lista.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="calendar-outline" set="Ionicons" size={40} color={C.muted} style={s.emptyIcon} />
            <Text style={s.emptyTitle}>
              {filtro === 'solicitadas' ? 'Nenhuma solicitação pendente' : 'Nenhuma consulta confirmada'}
            </Text>
            <Text style={s.emptySub}>
              {filtro === 'solicitadas'
                ? 'Novas solicitações do tutor aparecem aqui'
                : 'Consultas que você confirmar aparecem aqui'}
            </Text>
          </View>
        ) : (
          lista.map(item => {
            const t = TIPOS_EVENTO.find(x => x.valor === item.tipo);
            const sb = STATUS_EVENTO[item.status];
            return (
              <View key={item.id} style={s.card}>
                <View style={s.cardRow}>
                  <View style={[s.eventoIcone, { backgroundColor: t?.cor ?? C.g500 }]}>
                    <AppIcon name={t?.icon ?? 'document-text-outline'} set={t?.iconSet ?? 'Ionicons'} size={18} color={C.white} />
                  </View>
                  <View style={s.eventoInfo}>
                    <Text style={s.eventoTitulo}>{item.titulo}</Text>
                    <View style={s.eventoMetaRow}>
                      <AppIcon name="paw" set="MaterialCommunityIcons" size={11} color={C.muted} />
                      <Text style={s.eventoMeta}>{nomePet(item.petId)}</Text>
                      <Text style={s.eventoMetaDot}>•</Text>
                      <AppIcon name="time-outline" set="Ionicons" size={11} color={C.muted} />
                      <Text style={s.eventoMeta}>{formatarDataHora(item.data)}</Text>
                    </View>
                    {item.descricao ? <Text style={s.eventoDescricao}>{item.descricao}</Text> : null}
                  </View>
                </View>

                <View style={s.cardFooter}>
                  <View style={[s.badge, { backgroundColor: sb.bg }]}>
                    <Text style={[s.badgeText, { color: sb.color }]}>{sb.label}</Text>
                  </View>

                  <View style={s.acoes}>
                    {filtro === 'solicitadas' ? (
                      <>
                        <Pressable style={s.btnAcaoDanger} onPress={() => abrirModal('cancelar', item.id)}>
                          <Text style={s.btnAcaoDangerText}>Recusar</Text>
                        </Pressable>
                        <Pressable style={s.btnAcaoPrimaria} onPress={() => confirmarEvento(item.id)}>
                          <Text style={s.btnAcaoPrimariaText}>Confirmar</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable style={s.btnAcaoDanger} onPress={() => abrirModal('cancelar', item.id)}>
                          <Text style={s.btnAcaoDangerText}>Cancelar</Text>
                        </Pressable>
                        <Pressable style={s.btnAcaoPrimaria} onPress={() => abrirModal('concluir', item.id)}>
                          <Text style={s.btnAcaoPrimariaText}>Concluir</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalTipo !== null} transparent animationType="fade" onRequestClose={fecharModal}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>
              {modalTipo === 'concluir' ? 'Concluir consulta' : 'Cancelar consulta'}
            </Text>
            <Text style={s.modalLabel}>
              {modalTipo === 'concluir' ? 'Observações clínicas (opcional, uso interno)' : 'Motivo do cancelamento *'}
            </Text>
            <TextInput
              style={s.modalInput}
              value={textoModal}
              onChangeText={setTextoModal}
              placeholder={
                modalTipo === 'concluir'
                  ? 'Diagnóstico, procedimentos realizados, recomendações...'
                  : 'Ex: tutor solicitou reagendamento'
              }
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={4}
            />
            {modalTipo === 'concluir' && (
              <Text style={s.modalHint}>Essas observações não são exibidas para o tutor.</Text>
            )}
            <View style={s.modalAcoes}>
              <Pressable style={s.modalBtnVoltar} onPress={fecharModal}>
                <Text style={s.modalBtnVoltarText}>Voltar</Text>
              </Pressable>
              <Pressable
                style={[s.modalBtnConfirmar, modalTipo === 'cancelar' && { backgroundColor: C.danger }]}
                onPress={handleConfirmarModal}
              >
                <Text style={s.modalBtnConfirmarText}>
                  {modalTipo === 'concluir' ? 'Concluir consulta' : 'Confirmar cancelamento'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  filtroBar: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  filtroBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filtroBtnAtivo: { backgroundColor: C.g800, borderColor: C.g800 },
  filtroText: { fontSize: 12, fontWeight: '700', color: C.text },
  filtroTextAtivo: { color: C.white },

  scrollContent: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  eventoIcone: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 14, fontWeight: '700', color: C.text },
  eventoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  eventoMeta: { fontSize: 11, color: C.muted },
  eventoMetaDot: { fontSize: 11, color: C.muted, marginHorizontal: 2 },
  eventoDescricao: { fontSize: 12, color: C.muted, marginTop: 6, fontStyle: 'italic' },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.w50,
  },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  acoes: { flexDirection: 'row', gap: 8 },

  btnAcaoPrimaria: { backgroundColor: C.g600, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnAcaoPrimariaText: { color: C.white, fontSize: 12, fontWeight: '700' },
  btnAcaoDanger: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAcaoDangerText: { color: C.danger, fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,34,24,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitulo: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 },
  modalLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
    color: C.muted, marginBottom: 8,
  },
  modalInput: {
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: C.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalHint: { fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic' },
  modalAcoes: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalBtnVoltar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  modalBtnVoltarText: { fontSize: 14, fontWeight: '600', color: C.text },
  modalBtnConfirmar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.g600,
  },
  modalBtnConfirmarText: { fontSize: 14, fontWeight: '700', color: C.white },
});