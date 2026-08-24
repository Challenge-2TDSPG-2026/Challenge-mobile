import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { usePet } from '../context/PetContext';
import { TIPOS_EVENTO, SUGESTOES_TITULO } from '../constants';
import { AppIcon } from '../components/AppIcon';
import type { Evento } from '../types';

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', warn: '#e67e22',
};

function formatarData(text: string): string {
  const n = text.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
}

export default function AddEventoScreen() {
  const router = useRouter();
  const { petAtivo, adicionarEvento } = usePet();
  const [tipo, setTipo] = useState<Evento['tipo']>('vacina');
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const sugestoes = petAtivo ? (SUGESTOES_TITULO[tipo]?.[petAtivo.especie] ?? SUGESTOES_TITULO[tipo]?.['outro'] ?? []) : [];

  function validar() {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = 'Título é obrigatório';
    if (data.length < 10) e.data = 'Data inválida (DD/MM/AAAA)';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function parsarData(s: string): string {
    const [dd, mm, aaaa] = s.split('/');
    return new Date(`${aaaa}-${mm}-${dd}T12:00:00`).toISOString();
  }

  function statusInicial(iso: string): Evento['status'] {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const d = new Date(iso); d.setHours(0, 0, 0, 0);
    return d < hoje ? 'atrasado' : 'pendente';
  }

  async function handleSalvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      const iso = parsarData(data);
      await adicionarEvento({
        id: Date.now().toString(),
        petId: petAtivo?.id ?? '',
        tipo, titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        data: iso,
        status: statusInicial(iso),
        criadoEm: new Date().toISOString(),
      });
      router.back();
    } catch {
      // silent
    } finally { setSalvando(false); }
  }

  const tipoInfo = TIPOS_EVENTO.find(t => t.valor === tipo);
  const previewData = data.length === 10 ? parsarData(data) : null;

  return (
    <>
      <Stack.Screen options={{
        title: 'Registrar Evento de Saúde',
        headerStyle: { backgroundColor: C.g800 },
        headerTintColor: C.white,
        headerTitleStyle: { fontWeight: '700' },
      }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          <View style={s.preview}>
            <View style={[s.previewIcone, { backgroundColor: tipoInfo?.cor ?? C.g500 }]}>
              <AppIcon
                name={tipoInfo?.icon ?? 'document-text-outline'}
                set={tipoInfo?.iconSet ?? 'Ionicons'}
                size={26}
                color={C.white}
              />
            </View>
            <View style={s.previewInfo}>
              <Text style={s.previewTitulo}>{titulo || 'Título do evento'}</Text>
              <Text style={s.previewSub}>
                {tipoInfo?.label} • {previewData ? new Date(previewData).toLocaleDateString('pt-BR') : 'Data'}
              </Text>
              {descricao ? <Text style={s.previewDesc}>{descricao}</Text> : null}
            </View>
          </View>

          <View style={s.fg}>
            <Text style={s.fl}>Tipo *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {TIPOS_EVENTO.map(t => (
                  <Pressable
                    key={t.valor}
                    style={[s.tipoBtn, tipo === t.valor && { backgroundColor: t.cor, borderColor: t.cor }]}
                    onPress={() => { setTipo(t.valor as Evento['tipo']); setTitulo(''); }}
                  >
                    <AppIcon
                      name={t.icon}
                      set={t.iconSet}
                      size={20}
                      color={tipo === t.valor ? C.white : t.cor}
                    />
                    <Text style={[s.tipoLabel, tipo === t.valor && { color: C.white }]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {petAtivo && (
            <View style={s.fg}>
              <Text style={s.fl}>Pet</Text>
              <View style={s.fi}>
                <Text style={s.fiText}>{petAtivo.nome}</Text>
              </View>
            </View>
          )}

          <View style={s.fg}>
            <Text style={s.fl}>Título *</Text>
            <TextInput
              style={[s.fiInput, erros.titulo && s.fiInputErro]}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: V10 — dose anual"
              placeholderTextColor={C.muted}
            />
            {erros.titulo ? <Text style={s.textoErro}>{erros.titulo}</Text> : null}
          </View>

          {sugestoes.length > 0 && (
            <View style={s.fg}>
              <Text style={s.fl}>Sugestões rápidas</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {sugestoes.map(sg => (
                  <Pressable
                    key={sg}
                    style={[s.sugestaoBtn, { borderColor: tipoInfo?.cor ?? C.g500 }]}
                    onPress={() => setTitulo(sg)}
                  >
                    <Text style={[s.sugestaoText, { color: tipoInfo?.cor ?? C.g500 }]}>{sg}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={s.fg}>
            <Text style={s.fl}>Data Realização *</Text>
            <TextInput
              style={[s.fiInput, erros.data && s.fiInputErro]}
              value={data}
              onChangeText={v => setData(formatarData(v))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              maxLength={10}
            />
            {erros.data ? <Text style={s.textoErro}>{erros.data}</Text> : null}
          </View>

          <View style={s.fg}>
            <Text style={s.fl}>Descrição</Text>
            <TextInput
              style={[s.fiInput, s.fiTextarea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Clínica, veterinário, anotações..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={s.modalFoot}>
            <Pressable style={s.btnCancelar} onPress={() => router.back()}>
              <Text style={s.btnCancelarText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[s.btnSalvar, { backgroundColor: tipoInfo?.cor ?? C.g600 }, salvando && { opacity: 0.6 }]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <Text style={s.btnSalvarText}>Registrando...</Text>
              ) : (
                <>
                  <AppIcon
                    name={tipoInfo?.icon ?? 'document-text-outline'}
                    set={tipoInfo?.iconSet ?? 'Ionicons'}
                    size={16}
                    color={C.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={s.btnSalvarText}>Registrar Evento</Text>
                </>
              )}
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 20, paddingBottom: 40 },

  preview: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: C.border,
  },
  previewIcone: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  previewInfo: { flex: 1 },
  previewTitulo: { fontSize: 16, fontWeight: '700', color: C.text },
  previewSub: { fontSize: 12, color: C.muted, marginTop: 3 },
  previewDesc: { fontSize: 12, color: C.muted, marginTop: 4, fontStyle: 'italic' },

  fg: { marginBottom: 18 },
  fl: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', color: C.muted, marginBottom: 7,
  },

  fi: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  fiText: { fontSize: 14, color: C.text },

  fiInput: {
    width: '100%',
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: C.text,
  },
  fiInputErro: { borderColor: C.danger },
  fiTextarea: { minHeight: 80, textAlignVertical: 'top' },
  textoErro: { color: C.danger, fontSize: 12, marginTop: 4 },

  tipoBtn: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    minWidth: 80,
  },
  tipoLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 4 },

  sugestaoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: C.white,
  },
  sugestaoText: { fontSize: 12, fontWeight: '600' },

  modalFoot: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 8,
  },
  btnCancelar: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  btnCancelarText: { fontSize: 14, fontWeight: '600', color: C.text },
  btnSalvar: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSalvarText: { color: C.white, fontSize: 14, fontWeight: '700' },
});