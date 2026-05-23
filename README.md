# 🐾 ClyvoVet — Mobile Application

> **FIAP Challenge 2026 · 2º Ano ADS — 3° Semestre**
> Disciplina: Mobile Application Development

Aplicativo mobile desenvolvido em **React Native com Expo** para o desafio proposto pela **CLYVO VET**, como parte da avaliação prática do 1º semestre de 2026.

---

## 📋 Sobre o Projeto

O **ClyvoVet** é um protótipo funcional de aplicativo de saúde para pets, criado para endereçar a **descontinuidade do cuidado veterinário**. A solução permite que tutores organizem, acompanhem e gerenciem a jornada de saúde do seu animal em um só lugar — de forma proativa e personalizada.

O aplicativo resolve um problema real do mercado pet brasileiro: o responsável pelo animal normalmente só aciona a clínica em situações de urgência ou gatilhos óbvios (como vacinação), negligenciando o cuidado preventivo contínuo.

---

## ✨ Funcionalidades

- **Onboarding** — cadastro inicial do pet com validação de campos (nome, espécie, raça, data de nascimento e peso)
- **Dashboard** — visão geral com estatísticas de eventos pendentes, realizados e atrasados, além dos próximos eventos agendados
- **Agenda de Saúde** — listagem completa de eventos com filtros por tipo (vacina, vermífugo, consulta, medicamento, check-up) e por status (atrasados), com ações de concluir e remover
- **Adicionar Evento** — formulário para cadastro de novos eventos clínicos com tipo, título, descrição e data
- **Histórico Clínico** — linha do tempo agrupada por mês com taxa de conclusão e barra de progresso
- **Perfil** — dados do pet, preferências de notificação (Switches) e opção de reset completo

---

## 🗺️ Fluxo de Navegação

```
Onboarding (cadastro do pet)
        │
        ▼
   (tabs) Início  ──────────────────────────► add-evento
   (tabs) Agenda  ──── FAB ──────────────────► add-evento
   (tabs) Histórico
   (tabs) Perfil  ──── Reset ──────────────► Onboarding
```

O app utiliza **Expo Router** com 6 rotas navegáveis:

| Rota | Descrição |
|---|---|
| `/onboarding` | Cadastro inicial do pet |
| `/(tabs)/index` | Dashboard — tela inicial |
| `/(tabs)/agenda` | Agenda de eventos com filtros |
| `/(tabs)/historico` | Histórico clínico agrupado por mês |
| `/(tabs)/perfil` | Perfil do pet e preferências |
| `/add-evento` | Formulário de adição de evento |

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.0 | Plataforma e toolchain |
| Expo Router | ~6.0.23 | Navegação baseada em arquivos |
| TypeScript | ~5.9.2 | Tipagem estática |
| AsyncStorage | 2.2.0 | Persistência local de dados |
| @expo/vector-icons | ^15.0.3 | Ícones (Ionicons) |
| React Navigation | ^7.0.14 | Navegação nativa |

---

## 📁 Estrutura do Projeto

```
clyvovet/
├── app/
│   ├── _layout.tsx          # Layout raiz com PetProvider
│   ├── onboarding.tsx        # Tela de cadastro do pet
│   ├── add-evento.tsx        # Formulário de novo evento
│   └── (tabs)/
│       ├── _layout.tsx       # Tab navigator
│       ├── index.tsx         # Dashboard
│       ├── agenda.tsx        # Agenda com filtros
│       ├── historico.tsx     # Histórico clínico
│       └── perfil.tsx        # Perfil e configurações
├── context/
│   └── PetContext.tsx        # Context API global
├── storage/
│   └── petStorage.ts         # Funções AsyncStorage
├── types/
│   └── index.ts              # Interfaces Pet e Evento
├── constants/
│   └── index.ts              # Constantes, cores e tipos de evento
├── app.json
├── package.json
└── tsconfig.json
```

---

## 💾 Persistência com AsyncStorage

Todos os dados são salvos localmente no dispositivo usando `@react-native-async-storage/async-storage`. Os dados são restaurados automaticamente ao reabrir o app.

| Chave | Dados armazenados |
|---|---|
| `@petcare:pet` | Dados do pet (nome, espécie, raça, nascimento, peso) |
| `@petcare:eventos` | Lista completa de eventos de saúde |
| `@petcare:onboarding` | Flag indicando se o cadastro já foi feito |
| `@petcare:notificacoes` | Preferências de notificação do usuário |

---

## 🧱 Arquitetura de Estado

O estado global é gerenciado via **Context API** (`PetContext`), expondo:

```ts
{
  pet: Pet | null
  eventos: Evento[]
  preferencias: Record<string, boolean>
  onboardingConcluido: boolean
  carregando: boolean
  salvarNovoPet(pet)
  adicionarEvento(evento)
  concluirEvento(id)
  removerEvento(id)
  atualizarPreferencias(prefs)
  resetar()
}
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no dispositivo físico **ou** emulador Android/iOS configurado

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Challenge-2TDSPG-2026/Mobile-Application-Development.git
cd petcare

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
# ou
npx expo start
```

### Executar no dispositivo

```bash
# Android (emulador ou dispositivo físico via Expo Go)
npm run android

# iOS (somente macOS)
npm run ios
```

---

## 📱 Telas do Aplicativo

### Onboarding
Formulário com validação de todos os campos (Bean Validation mobile):
- Nome obrigatório
- Raça obrigatória
- Data de nascimento com máscara `DD/MM/AAAA`
- Peso numérico validado

### Dashboard (Início)
- Banner de boas-vindas com emoji da espécie
- Cards de estatísticas: Pendentes / Realizados / Atrasados
- Card do pet com dados resumidos
- Listagem dos próximos 5 eventos

### Agenda de Saúde
- Filtros horizontais por tipo de evento e status
- Lista completa ordenada por data
- Ações inline: concluir ✓ e remover 🗑️
- FAB para adicionar novo evento
- Detecção automática de eventos atrasados

### Adicionar Evento
- Seleção de tipo (vacina, vermífugo, consulta, medicamento, check-up, outro)
- Campos: título, descrição (opcional) e data
- Validação antes de salvar

### Histórico Clínico
- Cards de estatísticas (total, realizados, pendentes)
- Barra de progresso com taxa de conclusão
- Timeline agrupada por mês
- Tabela com tipo, data e status de cada evento

### Perfil
- Avatar com inicial do pet
- Dados cadastrais
- Preferências de notificação com Switch interativo
- Informações sobre o app
- Botão de reset (limpa todos os dados e volta ao onboarding)

---

## 📊 Tipos de Dados

```ts
interface Pet {
  id: string;
  nome: string;
  especie: 'cachorro' | 'gato' | 'pássaro' | 'outro';
  raca: string;
  dataNascimento: string; 
  peso: string;
}

interface Evento {
  id: string;
  petId: string;
  tipo: 'vacina' | 'vermifugo' | 'consulta' | 'medicamento' | 'checkup' | 'outro';
  titulo: string;
  descricao?: string;
  data: string; 
  status: 'pendente' | 'concluido' | 'atrasado';
  criadoEm: string;
}
```

---

## 🎯 Requisitos Atendidos

| Requisito | Status |
|---|---|
| Navegação com Expo Router | ✅ |
| Mínimo de 5 rotas navegáveis | ✅ 6 rotas |
| Protótipo visual funcional e coerente | ✅ |
| Formulário com manipulação de estado (useState) | ✅ Onboarding + Add Evento |
| Armazenamento com AsyncStorage | ✅ Pet, Eventos, Prefs e Onboarding |
| Dados restaurados ao reiniciar o app | ✅ |
| Demonstração em vídeo narrada | ✅ |
| Repositório no GitHub Classroom | ✅ |
| README.md | ✅ |

---

## 🏥 Contexto do Challenge — CLYVO VET

O desafio proposto pela **CLYVO VET** visa transformar a jornada de saúde animal de um modelo episódico e reativo para uma experiência **contínua, preventiva, inteligente e integrada**.

Este aplicativo mobile endereça o pilar de **experiência do responsável pelo pet**, oferecendo uma interface intuitiva para organizar eventos clínicos recorrentes, lembrar de vacinas, retornos e medicamentos por fase de vida, e gerar um histórico longitudinal estruturado.

---

## 👥 Equipe

| Nome | RM |
|---|---|
| **Arthur Brito da Silva** | *RM562085* |
| **Luiz Felipe Flosi dos Santos** | *RM563197* |
| **Pedro Henrique Brum Lopes** | *RM571780* |
| | |

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos — **FIAP Challenge 2026**.

Link para visualização do vídeo - https://youtu.be/j1JywTFRrR4