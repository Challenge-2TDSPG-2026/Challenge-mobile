import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useVet } from '../../context/VetContext';
import { DIAS_SEMANA_LABEL } from '../../constants';
import { AppIcon } from '../../components/AppIcon';
import { alertar } from '../../utils/alert';
import type { FaixaDisponibilidade, BloqueioAgenda } from '../../types';

const C = {
  g800: '#0e3326', g600: '#1a7a52', g500: '#22a06b', g200: '#a8e6c7', g100: '#d4f2e4',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545',
};

function formatarHoraInput(text: string): string {
  const n = text.replace(/\D/g, '');
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}:${n.slice(2, 4)}`;
}

function formatarDataInput(text: string): string {
  const n = text.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
}

function parsarData(s: string): string {
  const [dd, mm, aaaa] = s.split('/');
  return new Date(`${aaaa}-${mm}-${dd}T00:00:00`).toISOString();
}

function formatarDataExibicao(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function VetDisponibilidadeScreen() {
  const {
    veterinarioAtivoId,
    disponibilidade,
    adicionarFaixaDisponibilidade,
    removerFaixaDisponibilidade,
    bloqueios,
    adicionarBloqueio,
    removerBloqueio,
  } = useVet();

  const [diaSelecionado, setDiaSelecionado] = useState<FaixaDisponibilidade['diaSemana']>(1);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [erroFaixa, setErroFaixa] = useState('');

  const [dataBloqueio, setDataBloqueio] = useState('');
  const [motivoBloqueio, setMotivoBloqueio] = useState('');
  const [erroBloqueio, setErroBloqueio] = useState('');

  const disponibilidadeOrdenada = useMemo(
    () => [...disponibilidade].sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio)),
    [disponibilidade]
  );

  const bloqueiosOrdenados = useMemo(
    () => [...bloqueios].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    [bloqueios]
  );

  async function handleAdicionarFaixa() {
    setErroFaixa('');
    if (horaInicio.length !== 5 || horaFim.length !== 5) {
      setErroFaixa('Preencha os horários no formato HH:MM');
      return;
    }
    if (horaInicio >= horaFim) {
      setErroFaixa('O horário inicial deve ser antes do horário final');
      return;
    }
    if (!veterinarioAtivoId) return;

    const faixa: FaixaDisponibilidade = {
      id: Date.now().toString(),
      veterinarioId: veterinarioAtivoId,
      diaSemana: diaSelecionado,
      horaInicio,
      horaFim,
    };
    await adicionarFaixaDisponibilidade(faixa);
    setHoraInicio('');
    setHoraFim('');
  }

  function handleRemoverFaixa(id: string) {
    alertar('Remover horário?', 'Essa faixa de disponibilidade deixará de aceitar solicitações.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerFaixaDisponibilidade(id) },
    ]);
  }

  async function handleAdicionarBloqueio() {
    setErroBloqueio('');
    if (dataBloqueio.length !== 10) {
      setErroBloqueio('Data inválida (DD/MM/AAAA)');
      return;
    }
    if (!veterinarioAtivoId) return;

    const bloqueio: BloqueioAgenda = {
      id: Date.now().toString(),
      veterinarioId: veterinarioAtivoId,
      data: parsarData(dataBloqueio),
      motivo: motivoBloqueio.trim() || undefined,
    };
    await adicionarBloqueio(bloqueio);
    setDataBloqueio('');
    setMotivoBloqueio('');
  }

  function handleRemoverBloqueio(id: string) {
    alertar('Remover bloqueio?', 'Esse dia voltará a ficar disponível para solicitações.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerBloqueio(id) },
    ]);
  }

  if (!veterinarioAtivoId) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Horários de atendimento */}
      <Text style={s.secLabel}>Horários de Atendimento</Text>

      <View style={s.card}>
        {disponibilidadeOrdenada.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="time-outline" set="Ionicons" size={32} color={C.muted} style={{ marginBottom: 8 }} />
            <Text style={s.emptyTitle}>Nenhum horário definido</Text>
            <Text style={s.emptySub}>Tutores só conseguem solicitar consultas dentro dos horários cadastrados</Text>
          </View>
        ) : (
          disponibilidadeOrdenada.map((faixa, idx) => (
            <View key={faixa.id} style={[s.faixaRow, idx < disponibilidadeOrdenada.length - 1 && s.divisor]}>
              <View style={s.faixaDiaBadge}>
                <Text style={s.faixaDiaBadgeText}>{DIAS_SEMANA_LABEL[faixa.diaSemana].slice(0, 3)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.faixaDia}>{DIAS_SEMANA_LABEL[faixa.diaSemana]}</Text>
                <Text style={s.faixaHorario}>{faixa.horaInicio} — {faixa.horaFim}</Text>
              </View>
              <Pressable onPress={() => handleRemoverFaixa(faixa.id)} hitSlop={8}>
                <AppIcon name="trash-outline" set="Ionicons" size={18} color={C.danger} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={s.formCard}>
        <Text style={s.fl}>Dia da semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DIAS_SEMANA_LABEL.map((label, idx) => (
              <Pressable
                key={label}
                style={[s.diaBtn, diaSelecionado === idx && s.diaBtnAtivo]}
                onPress={() => setDiaSelecionado(idx as FaixaDisponibilidade['diaSemana'])}
              >
                <Text style={[s.diaBtnText, diaSelecionado === idx && s.diaBtnTextAtivo]}>{label.slice(0, 3)}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={s.fr}>
          <View style={s.campo}>
            <Text style={s.fl}>Início *</Text>
            <TextInput
              style={s.fi}
              value={horaInicio}
              onChangeText={v => setHoraInicio(formatarHoraInput(v))}
              placeholder="09:00"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={s.campo}>
            <Text style={s.fl}>Fim *</Text>
            <TextInput
              style={s.fi}
              value={horaFim}
              onChangeText={v => setHoraFim(formatarHoraInput(v))}
              placeholder="18:00"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>
        {erroFaixa ? <Text style={s.textoErro}>{erroFaixa}</Text> : null}

        <Pressable style={s.btnAdicionar} onPress={handleAdicionarFaixa}>
          <AppIcon name="add" set="Ionicons" size={16} color={C.white} style={{ marginRight: 6 }} />
          <Text style={s.btnAdicionarText}>Adicionar horário</Text>
        </Pressable>
      </View>

      {/* Bloqueios de agenda */}
      <Text style={s.secLabel}>Bloqueios (Férias, Folgas)</Text>

      <View style={s.card}>
        {bloqueiosOrdenados.length === 0 ? (
          <View style={s.empty}>
            <AppIcon name="airplane-outline" set="Ionicons" size={32} color={C.muted} style={{ marginBottom: 8 }} />
            <Text style={s.emptyTitle}>Nenhum bloqueio cadastrado</Text>
            <Text style={s.emptySub}>Dias bloqueados não aceitam novas solicitações</Text>
          </View>
        ) : (
          bloqueiosOrdenados.map((bloqueio, idx) => (
            <View key={bloqueio.id} style={[s.faixaRow, idx < bloqueiosOrdenados.length - 1 && s.divisor]}>
              <View style={[s.faixaDiaBadge, { backgroundColor: '#fee2e2' }]}>
                <AppIcon name="close" set="Ionicons" size={14} color={C.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.faixaDia}>{formatarDataExibicao(bloqueio.data)}</Text>
                {bloqueio.motivo ? <Text style={s.faixaHorario}>{bloqueio.motivo}</Text> : null}
              </View>
              <Pressable onPress={() => handleRemoverBloqueio(bloqueio.id)} hitSlop={8}>
                <AppIcon name="trash-outline" set="Ionicons" size={18} color={C.danger} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={s.formCard}>
        <Text style={s.fl}>Data *</Text>
        <TextInput
          style={[s.fi, { marginBottom: 14 }]}
          value={dataBloqueio}
          onChangeText={v => setDataBloqueio(formatarDataInput(v))}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={C.muted}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={s.fl}>Motivo (opcional)</Text>
        <TextInput
          style={[s.fi, { marginBottom: 4 }]}
          value={motivoBloqueio}
          onChangeText={setMotivoBloqueio}
          placeholder="Ex: Férias"
          placeholderTextColor={C.muted}
        />
        {erroBloqueio ? <Text style={s.textoErro}>{erroBloqueio}</Text> : null}

        <Pressable style={[s.btnAdicionar, { marginTop: 14 }]} onPress={handleAdicionarBloqueio}>
          <AppIcon name="add" set="Ionicons" size={16} color={C.white} style={{ marginRight: 6 }} />
          <Text style={s.btnAdicionarText}>Adicionar bloqueio</Text>
        </Pressable>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 16, paddingBottom: 40 },

  secLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    color: C.muted, marginBottom: 10, marginTop: 4, paddingLeft: 2,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  divisor: { borderBottomWidth: 1, borderBottomColor: C.border },

  faixaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  faixaDiaBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.g100, justifyContent: 'center', alignItems: 'center',
  },
  faixaDiaBadgeText: { fontSize: 11, fontWeight: '700', color: C.g800, textTransform: 'uppercase' },
  faixaDia: { fontSize: 13, fontWeight: '700', color: C.text },
  faixaHorario: { fontSize: 12, color: C.muted, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4 },
  emptySub: { fontSize: 11, color: C.muted, textAlign: 'center', paddingHorizontal: 12, paddingBottom: 8 },

  formCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 24,
  },
  fl: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', color: C.muted, marginBottom: 7,
  },
  fr: { flexDirection: 'row', gap: 12 },
  campo: { flex: 1 },
  fi: {
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
  },
  textoErro: { color: C.danger, fontSize: 12, marginTop: 8 },

  diaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  diaBtnAtivo: { backgroundColor: C.g600, borderColor: C.g600 },
  diaBtnText: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase' },
  diaBtnTextAtivo: { color: C.white },

  btnAdicionar: {
    flexDirection: 'row',
    backgroundColor: C.g600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnAdicionarText: { color: C.white, fontSize: 13, fontWeight: '700' },
});