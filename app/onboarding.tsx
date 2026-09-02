import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ESPECIES } from '../constants';
import { usePet } from '../context/PetContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/httpClient';
import { alertar } from '../utils/alert';
import { AppIcon } from '../components/AppIcon';
import type { Pet } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  g900: '#0a2218', g800: '#0e3326', g700: '#155c3f', g600: '#1a7a52',
  g500: '#22a06b', g400: '#3db87e', g200: '#a8e6c7', g100: '#d4f2e4', g50: '#edfaf3',
  cream: '#fafaf8', w50: '#f9f7f4', w100: '#f0ece5',
  text: '#1a1512', muted: '#7a6a5e', border: '#e8e2da', white: '#fff',
  danger: '#dc3545',
};

type Aba = 'cadastrar' | 'entrar';
type EtapaCadastro = 'conta' | 'pet';

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

// ⚠️ DEV ONLY — conta seedada pelo MockData.java, só existe em ambiente de dev/teste
const EMAIL_TESTE = 'maria@email.com';
const SENHA_TESTE = 'senha123';

function formatarData(text: string): string {
  const n = text.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
}

function formatarCpf(text: string): string {
  return text.replace(/\D/g, '').slice(0, 11);
}

function formatarTelefone(text: string): string {
  return text.replace(/\D/g, '').slice(0, 11);
}

function mensagemDeErro(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { adicionarPet } = usePet();
  const { autenticado, onboardingConcluidoIgnorar, login, registrar, erro: erroAuth, limparErro } = useAuth() as any;
  const { onboardingConcluido } = usePet();

  const [aba, setAba] = useState<Aba>('cadastrar');
  const [etapaCadastro, setEtapaCadastro] = useState<EtapaCadastro>('conta');
  const [conteudoVisivel, setConteudoVisivel] = useState(true);
  const [tabsWidth, setTabsWidth] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (autenticado && !onboardingConcluido) {
      setAba('cadastrar');
      setEtapaCadastro('pet');
    }
  }, [autenticado, onboardingConcluido]);

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

  const [nomeTutor, setNomeTutor] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [errosConta, setErrosConta] = useState<Record<string, string>>({});

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<Pet['especie']>('cachorro');
  const [raca, setRaca] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [errosPet, setErrosPet] = useState<Record<string, string>>({});

  function validarContaCadastro(): boolean {
    const e: Record<string, string> = {};
    if (!nomeTutor.trim()) e.nomeTutor = 'Nome é obrigatório';
    if (!email.trim() || !email.includes('@')) e.email = 'E-mail inválido';
    if (cpf.length !== 11) e.cpf = 'CPF deve ter 11 dígitos';
    if (!senha.trim() || senha.length < 6) e.senha = 'Senha deve ter pelo menos 6 caracteres';
    setErrosConta(e);
    return Object.keys(e).length === 0;
  }

  function validarContaLogin(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim() || !email.includes('@')) e.email = 'E-mail inválido';
    if (!senha.trim()) e.senha = 'Informe sua senha';
    setErrosConta(e);
    return Object.keys(e).length === 0;
  }

  async function handleContinuarConta() {
    if (!validarContaCadastro()) return;
    limparErro();
    setEnviando(true);
    try {
      await registrar({ nome: nomeTutor.trim(), email, senha, cpf, telefone: telefone || undefined });
      trocarConteudo(() => setEtapaCadastro('pet'));
    } catch (e) {
      alertar('Não foi possível criar sua conta', mensagemDeErro(e, 'Tente novamente em instantes.'));
    } finally {
      setEnviando(false);
    }
  }

  function validarPet(): boolean {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório';
    if (!raca.trim()) e.raca = 'Raça é obrigatória';
    if (dataNascimento.length < 10) e.dataNascimento = 'Data inválida (DD/MM/AAAA)';
    if (!peso.trim() || isNaN(Number(peso.replace(',', '.')))) e.peso = 'Peso inválido';
    setErrosPet(e);
    return Object.keys(e).length === 0;
  }

  function parsarData(s: string): string {
    const [dd, mm, aaaa] = s.split('/');
    return new Date(`${aaaa}-${mm}-${dd}T12:00:00`).toISOString();
  }

  async function handleSalvarPet() {
    if (!validarPet()) return;
    setEnviando(true);
    try {
      const pet: Pet = {
        id: '', 
        nome: nome.trim(), especie, raca: raca.trim(),
        dataNascimento: parsarData(dataNascimento), peso: peso.trim(),
      };
      await adicionarPet(pet);
      router.replace('/(tabs)');
    } catch (e) {
      alertar('Não foi possível cadastrar o pet', mensagemDeErro(e, 'Tente novamente em instantes.'));
    } finally {
      setEnviando(false);
    }
  }

  async function handleEntrar() {
    if (!validarContaLogin()) return;
    limparErro();
    setEnviando(true);
    try {
      await login(email, senha);
    } catch (e) {
      alertar('Não foi possível entrar', mensagemDeErro(e, 'Verifique seu e-mail e senha.'));
    } finally {
      setEnviando(false);
    }
  }

  function preencherContaTeste() {
    setEmail(EMAIL_TESTE);
    setSenha(SENHA_TESTE);
    setErrosConta({});
  }

  function trocarAba(novaAba: Aba) {
    if (novaAba === aba) return;
    trocarConteudo(() => {
      setAba(novaAba);
      setEtapaCadastro('conta');
      setErrosConta({});
    });
  }

  const especieInfo = ESPECIES.find(e => e.valor === especie);
  const indicatorTranslateX = tabsWidth > 0 && aba === 'entrar' ? tabsWidth / 2 : 0;
  const mostrarSeletorAba = !(autenticado && !onboardingConcluido);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.g900 }}
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
              <AppIcon name="paw" set="MaterialCommunityIcons" size={26} color={C.white} />
            </View>
            <Text style={s.authName}>ClyvoVet</Text>
            <Text style={s.authSub}>Plataforma de Saúde Animal</Text>
          </View>

          {mostrarSeletorAba && (
            <View
              style={s.authTabs}
              onLayout={e => setTabsWidth(e.nativeEvent.layout.width)}
            >
              <Pressable style={s.authTab} onPress={() => trocarAba('cadastrar')}>
                <Text style={[s.authTabText, aba !== 'cadastrar' && s.authTabTextInativa]}>
                  Cadastrar Pet
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
          )}

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

                {mostrarSeletorAba && (
                  <>
                    <View style={s.passos}>
                      <View style={[s.passoDot, etapaCadastro === 'conta' && s.passoDotAtivo]} />
                      <View style={s.passoLinha} />
                      <View style={[s.passoDot, etapaCadastro === 'pet' && s.passoDotAtivo]} />
                    </View>
                    <Text style={s.passoLabel}>
                      {etapaCadastro === 'conta' ? 'Passo 1 de 2 — Sua conta' : 'Passo 2 de 2 — Dados do pet'}
                    </Text>
                  </>
                )}

                {etapaCadastro === 'conta' ? (
                  <>
                    <View style={s.loginIntro}>
                      <AppIcon name="person-add-outline" set="Ionicons" size={22} color={C.g600} />
                      <Text style={s.loginIntroText}>
                        Crie sua conta primeiro. Depois disso você cadastra os dados do seu pet.
                      </Text>
                    </View>

                    <Campo
                      label="Nome completo *"
                      value={nomeTutor}
                      onChangeText={setNomeTutor}
                      placeholder="Maria Silva"
                      erro={errosConta.nomeTutor}
                    />

                    <Campo
                      label="E-mail *"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="voce@email.com"
                      keyboardType="email-address"
                      erro={errosConta.email}
                    />

                    <View style={s.fr}>
                      <Campo
                        label="CPF *"
                        value={cpf}
                        onChangeText={(v: string) => setCpf(formatarCpf(v))}
                        placeholder="Somente números"
                        keyboardType="numeric"
                        maxLength={11}
                        erro={errosConta.cpf}
                      />
                      <Campo
                        label="Telefone"
                        value={telefone}
                        onChangeText={(v: string) => setTelefone(formatarTelefone(v))}
                        placeholder="Opcional"
                        keyboardType="numeric"
                        maxLength={11}
                      />
                    </View>

                    <Campo
                      label="Senha *"
                      value={senha}
                      onChangeText={setSenha}
                      placeholder="••••••••"
                      secureTextEntry
                      erro={errosConta.senha}
                    />

                    <Pressable
                      style={[s.btnAuth, enviando && { opacity: 0.6 }]}
                      onPress={handleContinuarConta}
                      disabled={enviando}
                    >
                      <Text style={s.btnAuthText}>{enviando ? 'Criando conta...' : 'Continuar →'}</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {mostrarSeletorAba && (
                      <Pressable
                        style={s.btnVoltar}
                        onPress={() => trocarConteudo(() => setEtapaCadastro('conta'))}
                      >
                        <AppIcon name="arrow-back-outline" set="Ionicons" size={14} color={C.g600} />
                        <Text style={s.btnVoltarText}>Voltar</Text>
                      </Pressable>
                    )}

                    <View style={s.previewCard}>
                      <AppIcon
                        name={especieInfo?.icon ?? 'paw'}
                        set={especieInfo?.iconSet ?? 'MaterialCommunityIcons'}
                        size={38}
                        color={C.g600}
                        style={s.previewIcon}
                      />
                      <View style={s.previewInfo}>
                        <Text style={s.previewNome}>{nome || 'Nome do pet'}</Text>
                        <Text style={s.previewSub}>{raca || 'Raça'} • {peso ? `${peso} kg` : 'Peso'}</Text>
                        <Text style={s.previewSub}>
                          {dataNascimento.length === 10 ? `Nasc: ${dataNascimento}` : 'Data de nascimento'}
                        </Text>
                      </View>
                    </View>

                    <View style={s.fg}>
                      <Text style={s.fl}>Espécie *</Text>
                      <View style={s.especieRow}>
                        {ESPECIES.map(esp => (
                          <Pressable
                            key={esp.valor}
                            style={[s.especieBtn, especie === esp.valor && s.especieBtnAtivo]}
                            onPress={() => setEspecie(esp.valor as Pet['especie'])}
                          >
                            <AppIcon
                              name={esp.icon}
                              set={esp.iconSet}
                              size={20}
                              color={especie === esp.valor ? C.white : C.muted}
                            />
                            <Text style={[s.especieLabel, especie === esp.valor && s.especieLabelAtivo]}>
                              {esp.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    <View style={s.fr}>
                      <Campo label="Nome *" value={nome} onChangeText={setNome} placeholder="Buddy" erro={errosPet.nome} />
                      <Campo label="Raça *" value={raca} onChangeText={setRaca} placeholder="Golden Retriever" erro={errosPet.raca} />
                    </View>

                    <View style={s.fr}>
                      <Campo
                        label="Nascimento *"
                        value={dataNascimento}
                        onChangeText={(v: string) => setDataNascimento(formatarData(v))}
                        placeholder="DD/MM/AAAA"
                        keyboardType="numeric"
                        maxLength={10}
                        erro={errosPet.dataNascimento}
                      />
                      <Campo
                        label="Peso (kg) *"
                        value={peso}
                        onChangeText={setPeso}
                        placeholder="5.0"
                        keyboardType="decimal-pad"
                        erro={errosPet.peso}
                      />
                    </View>

                    <Pressable
                      style={[s.btnAuth, enviando && { opacity: 0.6 }]}
                      onPress={handleSalvarPet}
                      disabled={enviando}
                    >
                      <Text style={s.btnAuthText}>
                        {enviando ? 'Salvando...' : 'Finalizar cadastro →'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : (
              <View style={s.authForm}>

                <View style={s.loginIntro}>
                  <AppIcon name="lock-closed-outline" set="Ionicons" size={22} color={C.g600} />
                  <Text style={s.loginIntroText}>
                    Entre com sua conta para acessar os pets já cadastrados.
                  </Text>
                </View>

                {__DEV__ && (
                  <Pressable style={s.btnDev} onPress={preencherContaTeste}>
                    <AppIcon name="flask-outline" set="Ionicons" size={14} color="#e67e22" />
                    <Text style={s.btnDevText}>Preencher conta de teste (dev)</Text>
                  </Pressable>
                )}

                <Campo
                  label="E-mail *"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@email.com"
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
                  style={[s.btnAuth, enviando && { opacity: 0.6 }]}
                  onPress={handleEntrar}
                  disabled={enviando}
                >
                  <Text style={s.btnAuthText}>{enviando ? 'Entrando...' : 'Entrar →'}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

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
    backgroundColor: C.g800,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  authLogo: {
    width: 52,
    height: 52,
    backgroundColor: C.g500,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  authName: { fontSize: 26, fontWeight: '700', color: C.white, letterSpacing: -0.5, marginBottom: 4 },
  authSub: { fontSize: 12, color: C.g200 },

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
    backgroundColor: C.g500,
  },
  authTabText: { fontSize: 13, fontWeight: '600', color: C.g600 },
  authTabTextInativa: { color: C.muted },

  authForm: { padding: 24 },

  passos: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  passoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  passoDotAtivo: { backgroundColor: C.g500 },
  passoLinha: { width: 28, height: 2, backgroundColor: C.border, marginHorizontal: 6 },
  passoLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textAlign: 'center', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.4 },

  btnVoltar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, alignSelf: 'flex-start' },
  btnVoltarText: { fontSize: 12, fontWeight: '600', color: C.g600 },

  btnDev: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e67e22',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 9,
    marginBottom: 16,
    backgroundColor: '#fff8f0',
  },
  btnDevText: { fontSize: 12, fontWeight: '700', color: '#e67e22' },

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

  especieRow: { flexDirection: 'row', gap: 8 },
  especieBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.w50,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  especieBtnAtivo: { backgroundColor: C.g600, borderColor: C.g600 },
  especieLabel: { fontSize: 11, color: C.muted, marginTop: 3, fontWeight: '600' },
  especieLabelAtivo: { color: C.white },

  btnAuth: {
    backgroundColor: C.g600,
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
});