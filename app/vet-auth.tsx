import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ESPECIALIDADES_VET } from '../constants';
import { useVet } from '../context/VetContext';
import { authService } from '../services/authService';
import { alertar } from '../utils/alert';
import { AppIcon } from '../components/AppIcon';
import type { Veterinario } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  v900: '#0a1a2e', v800: '#0e2a4a', v700: '#154a7a', v600: '#1a63a3',
  v500: '#2563eb', v200: '#bfdbfe', v100: '#dbeafe',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545', g500: '#22a06b', g200: '#a8e6c7',
};

type Aba = 'cadastrar' | 'entrar';
type EtapaCadastro = 'conta' | 'dados';

const transicaoWeb = Platform.OS === 'web'
  ? ({
      transitionProperty: 'opacity, transform',
      transitionDuration: '220ms',
      transitionTimingFunction: 'ease',
    } as any)
  : {};

const transicaoIndicadorWeb = Platform.OS === 'web'
  ? ({
      transitionProperty: 'transform',
      transitionDuration: '250ms',
      transitionTimingFunction: 'ease',
    } as any)
  : {};

export default function VetAuthScreen() {
  const router = useRouter();
  const { cadastrarVeterinario, veterinarios, veterinarioAtivoId, selecionarVeterinario } = useVet();

  const [aba, setAba] = useState<Aba>('cadastrar');
  const [etapaCadastro, setEtapaCadastro] = useState<EtapaCadastro>('conta');
  const [conteudoVisivel, setConteudoVisivel] = useState(true);
  const [tabsWidth, setTabsWidth] = useState(0);

  function trocarConteudo(atualizarEstado: () => void) {
    if (Platform.OS === 'web') {
      setConteudoVisivel(false);
      setTimeout(() => {
        atualizarEstado();
        requestAnimationFrame(() => setConteudoVisivel(true));
      }, 130);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      atualizarEstado();
    }
  }

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errosConta, setErrosConta] = useState<Record<string, string>>({});
  const [autenticando, setAutenticando] = useState(false);

  const [nome, setNome] = useState('');
  const [crmv, setCrmv] = useState('');
  const [especialidade, setEspecialidade] = useState<string>(ESPECIALIDADES_VET[0]);
  const [clinica, setClinica] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  function validarConta(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim() || !email.includes('@')) e.email = 'E-mail inválido';
    if (!senha.trim() || senha.length < 6) e.senha = 'Senha deve ter pelo menos 6 caracteres';
    setErrosConta(e);
    return Object.keys(e).length === 0;
  }

  async function handleContinuarConta() {
    if (!validarConta()) return;
    setAutenticando(true);
    try {
      await authService.registrar(email, senha, 'veterinario');
      trocarConteudo(() => setEtapaCadastro('dados'));
    } catch {
      alertar('Erro', 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setAutenticando(false);
    }
  }

  function validarDados(): boolean {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório';
    if (!crmv.trim()) e.crmv = 'CRMV é obrigatório';
    if (!clinica.trim()) e.clinica = 'Clínica é obrigatória';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleFinalizarCadastro() {
    if (!validarDados()) return;
    setSalvando(true);
    try {
      const veterinario: Veterinario = {
        id: Date.now().toString(),
        nome: nome.trim(),
        crmv: crmv.trim(),
        especialidade,
        clinica: clinica.trim(),
        criadoEm: new Date().toISOString(),
      };
      await cadastrarVeterinario(veterinario);
      router.replace('/(vet)');
    } catch {
      // silent
    } finally { setSalvando(false); }
  }

  async function handleEntrar() {
    if (!validarConta()) return;
    setAutenticando(true);
    try {
      await authService.login(email, senha, 'veterinario');
      if (veterinarios.length === 0) {
        alertar(
          'Nenhum veterinário encontrado',
          'Não há cadastro de veterinário neste dispositivo. Cadastre-se primeiro.'
        );
        return;
      }
      if (!veterinarioAtivoId) {
        await selecionarVeterinario(veterinarios[0].id);
      }
      router.replace('/(vet)');
    } finally {
      setAutenticando(false);
    }
  }

  function trocarAba(novaAba: Aba) {
    if (novaAba === aba) return;
    trocarConteudo(() => {
      setAba(novaAba);
      setEtapaCadastro('conta');
      setErrosConta({});
    });
  }

  const indicatorTranslateX = tabsWidth > 0 && aba === 'entrar' ? tabsWidth / 2 : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.v900 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >

        <View style={s.authCard}>

          <View style={s.authHdr}>
            <View style={s.authLogo}>
              <AppIcon name="medical-bag" set="MaterialCommunityIcons" size={26} color={C.white} />
            </View>
            <Text style={s.authName}>ClyvoVet</Text>
            <Text style={s.authSub}>Portal do Veterinário</Text>
          </View>

          <View
            style={s.authTabs}
            onLayout={e => setTabsWidth(e.nativeEvent.layout.width)}
          >
            <Pressable style={s.authTab} onPress={() => trocarAba('cadastrar')}>
              <Text style={[s.authTabText, aba !== 'cadastrar' && s.authTabTextInativa]}>
                Cadastrar
              </Text>
            </Pressable>
            <Pressable style={s.authTab} onPress={() => trocarAba('entrar')}>
              <Text style={[s.authTabText, aba !== 'entrar' && s.authTabTextInativa]}>
                Entrar
              </Text>
            </Pressable>

            {tabsWidth > 0 && (
              <View
                style={[
                  s.authTabIndicator,
                  { width: tabsWidth / 2, transform: [{ translateX: indicatorTranslateX }] },
                  transicaoIndicadorWeb,
                ]}
              />
            )}
          </View>

          <View
            style={[
              {
                opacity: conteudoVisivel ? 1 : 0,
                transform: [{ translateY: conteudoVisivel ? 0 : 10 }],
              },
              transicaoWeb,
            ]}
          >
            {aba === 'cadastrar' ? (
              <View style={s.authForm}>

                <View style={s.passos}>
                  <View style={[s.passoDot, etapaCadastro === 'conta' && s.passoDotAtivo]} />
                  <View style={s.passoLinha} />
                  <View style={[s.passoDot, etapaCadastro === 'dados' && s.passoDotAtivo]} />
                </View>
                <Text style={s.passoLabel}>
                  {etapaCadastro === 'conta' ? 'Passo 1 de 2 — Sua conta' : 'Passo 2 de 2 — Dados profissionais'}
                </Text>

                {etapaCadastro === 'conta' ? (
                  <>
                    <View style={s.loginIntro}>
                      <AppIcon name="person-add-outline" set="Ionicons" size={22} color={C.v600} />
                      <Text style={s.loginIntroText}>
                        Crie sua conta de veterinário. Depois disso você preenche seus dados profissionais.
                      </Text>
                    </View>

                    <Campo
                      label="E-mail *"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="voce@clinica.com"
                      keyboardType="email-address"
                      erro={errosConta.email}
                    />

                    <Campo
                      label="Senha *"
                      value={senha}
                      onChangeText={setSenha}
                      placeholder="••••••••"
                      secureTextEntry
                      erro={errosConta.senha}
                    />

                    <Pressable
                      style={[s.btnAuth, autenticando && { opacity: 0.6 }]}
                      onPress={handleContinuarConta}
                      disabled={autenticando}
                    >
                      <Text style={s.btnAuthText}>
                        {autenticando ? 'Criando conta...' : 'Continuar →'}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      style={s.btnVoltar}
                      onPress={() => trocarConteudo(() => setEtapaCadastro('conta'))}
                    >
                      <AppIcon name="arrow-back-outline" set="Ionicons" size={14} color={C.v600} />
                      <Text style={s.btnVoltarText}>Voltar</Text>
                    </Pressable>

                    <View style={s.previewCard}>
                      <AppIcon
                        name="medical-bag"
                        set="MaterialCommunityIcons"
                        size={34}
                        color={C.v600}
                        style={s.previewIcon}
                      />
                      <View style={s.previewInfo}>
                        <Text style={s.previewNome}>{nome || 'Nome do veterinário'}</Text>
                        <Text style={s.previewSub}>{crmv ? `CRMV ${crmv}` : 'CRMV'} • {especialidade}</Text>
                        <Text style={s.previewSub}>{clinica || 'Clínica / local de atendimento'}</Text>
                      </View>
                    </View>

                    <Campo label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Dra. Ana Souza" erro={erros.nome} />

                    <View style={s.fr}>
                      <Campo label="CRMV *" value={crmv} onChangeText={setCrmv} placeholder="SP-12345" erro={erros.crmv} />
                    </View>

                    <View style={s.fg}>
                      <Text style={s.fl}>Especialidade *</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                          {ESPECIALIDADES_VET.map(esp => (
                            <Pressable
                              key={esp}
                              style={[s.especialidadeBtn, especialidade === esp && s.especialidadeBtnAtivo]}
                              onPress={() => setEspecialidade(esp)}
                            >
                              <Text style={[s.especialidadeLabel, especialidade === esp && s.especialidadeLabelAtivo]}>
                                {esp}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <Campo label="Clínica / Local de atendimento *" value={clinica} onChangeText={setClinica} placeholder="Clínica VetSaúde" erro={erros.clinica} />

                    <Pressable
                      style={[s.btnAuth, salvando && { opacity: 0.6 }]}
                      onPress={handleFinalizarCadastro}
                      disabled={salvando}
                    >
                      <Text style={s.btnAuthText}>
                        {salvando ? 'Salvando...' : 'Finalizar cadastro →'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : (
              <View style={s.authForm}>

                <View style={s.loginIntro}>
                  <AppIcon name="lock-closed-outline" set="Ionicons" size={22} color={C.v600} />
                  <Text style={s.loginIntroText}>
                    Entre com sua conta para acessar a agenda e os pacientes.
                  </Text>
                </View>

                <Campo
                  label="E-mail *"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@clinica.com"
                  keyboardType="email-address"
                  erro={errosConta.email}
                />

                <Campo
                  label="Senha *"
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="••••••••"
                  secureTextEntry
                  erro={errosConta.senha}
                />

                <Pressable
                  style={[s.btnAuth, autenticando && { opacity: 0.6 }]}
                  onPress={handleEntrar}
                  disabled={autenticando}
                >
                  <Text style={s.btnAuthText}>{autenticando ? 'Entrando...' : 'Entrar →'}</Text>
                </Pressable>

                <Text style={s.loginNota}>
                  Ainda sem backend — o login valida localmente os dados deste dispositivo.
                </Text>

              </View>
            )}
          </View>
        </View>

        <Pressable style={s.linkTutor} onPress={() => router.push('/onboarding')}>
          <AppIcon name="paw" set="MaterialCommunityIcons" size={14} color={C.v200} />
          <Text style={s.linkTutorText}>Sou tutor → Acessar o app do tutor</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, value, onChangeText, placeholder, keyboardType, maxLength, erro, secureTextEntry }: any) {
  return (
    <View style={s.campo}>
      <Text style={s.fl}>{label}</Text>
      <TextInput
        style={[s.fi, erro && s.fiErro]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        autoCapitalize={secureTextEntry ? 'none' : undefined}
      />
      {erro ? <Text style={s.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 48 },

  authCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  authHdr: {
    backgroundColor: C.v800,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  authLogo: {
    width: 52,
    height: 52,
    backgroundColor: C.v500,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  authName: { fontSize: 26, fontWeight: '700', color: C.white, letterSpacing: -0.5, marginBottom: 4 },
  authSub: { fontSize: 12, color: C.v200 },

  authTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    position: 'relative',
  },
  authTab: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  authTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
    backgroundColor: C.v500,
  },
  authTabText: { fontSize: 13, fontWeight: '600', color: C.v600 },
  authTabTextInativa: { color: C.muted },

  authForm: { padding: 24 },

  passos: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  passoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  passoDotAtivo: { backgroundColor: C.v500 },
  passoLinha: { width: 28, height: 2, backgroundColor: C.border, marginHorizontal: 6 },
  passoLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textAlign: 'center', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.4 },

  btnVoltar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, alignSelf: 'flex-start' },
  btnVoltarText: { fontSize: 12, fontWeight: '600', color: C.v600 },

  previewCard: {
    backgroundColor: C.w50,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  previewIcon: { marginRight: 14 },
  previewInfo: { flex: 1 },
  previewNome: { fontSize: 16, fontWeight: '700', color: C.text },
  previewSub: { fontSize: 12, color: C.muted, marginTop: 2 },

  fg: { marginBottom: 16 },
  fl: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', color: C.muted, marginBottom: 6,
  },
  fr: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  campo: { flex: 1, marginBottom: 16 },
  fi: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
  },
  fiErro: { borderColor: C.danger },
  textoErro: { color: C.danger, fontSize: 12, marginTop: 4 },

  especialidadeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  especialidadeBtnAtivo: { backgroundColor: C.v600, borderColor: C.v600 },
  especialidadeLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  especialidadeLabelAtivo: { color: C.white },

  btnAuth: {
    backgroundColor: C.v600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnAuthText: { color: C.white, fontSize: 14, fontWeight: '700' },

  loginIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.w50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  loginIntroText: { flex: 1, fontSize: 12, color: C.muted },
  loginNota: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    marginTop: 12,
  },

  linkTutor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  linkTutorText: { fontSize: 12, fontWeight: '600', color: C.v200 },
});