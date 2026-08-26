# ClyvoVet - Mobile Application

**FIAP Challenge 2026 - 2º Ano ADS - 3° Semestre**
**Disciplina: Mobile Application Development**

Aplicativo mobile desenvolvido em React Native com Expo para o desafio proposto pela CLYVO VET, como parte da avaliação prática do 1º semestre de 2026.

---

## Sobre o Projeto

O ClyvoVet é um protótipo funcional de aplicativo de saúde para animais de estimação, criado para endereçar a descontinuidade do cuidado veterinário. A solução permite que tutores organizem, acompanhem e gerenciem a jornada de saúde do seu animal em um só lugar, de forma proativa e personalizada.

O aplicativo resolve um problema real do mercado veterinário brasileiro: o responsável pelo animal normalmente aciona a clínica apenas em situações de urgência ou gatilhos óbvios (como vacinação), negligenciando o cuidado preventivo contínuo.

---

## Funcionalidades Principais

- **Onboarding:** Cadastro inicial do animal com validação de campos (nome, espécie, raça, data de nascimento e peso).
- **Dashboard:** Visão geral com estatísticas de eventos pendentes, realizados e atrasados, além dos próximos eventos agendados.
- **Agenda de Saúde:** Listagem completa de eventos com filtros por tipo (vacina, vermífugo, consulta, medicamento, check-up) e por status (atrasados), com ações de concluir e remover.
- **Adicionar Evento:** Formulário para cadastro de novos eventos clínicos contendo tipo, título, descrição e data.
- **Histórico Clínico:** Linha do tempo agrupada por mês com taxa de conclusão e barra de progresso.
- **Perfil:** Dados do animal, preferências de notificação e opção de reinicialização completa do aplicativo (reset).

---

## Fluxo de Navegação

O aplicativo utiliza o Expo Router contendo 6 rotas navegáveis:

| Rota | Descrição |
|---|---|
| `/onboarding` | Cadastro inicial do animal |
| `/(tabs)/index` | Dashboard (tela inicial) |
| `/(tabs)/agenda` | Agenda de eventos com filtros |
| `/(tabs)/historico` | Histórico clínico agrupado por mês |
| `/(tabs)/perfil` | Perfil do animal e configurações |
| `/add-evento` | Formulário de adição de evento |

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.0 | Plataforma e toolchain |
| Expo Router | ~6.0.23 | Navegação baseada em arquivos |
| TypeScript | ~5.9.2 | Tipagem estática |
| AsyncStorage | 2.2.0 | Persistência local de dados |
| @expo/vector-icons | ^15.0.3 | Ícones nativos (Ionicons) |
| React Navigation | ^7.0.14 | Navegação nativa |

---

## Estrutura do Projeto

```text
clyvovet/
├── app/
│   ├── _layout.tsx          # Layout raiz com PetProvider
│   ├── onboarding.tsx       # Tela de cadastro
│   ├── add-evento.tsx       # Formulário de novo evento
│   └── (tabs)/
│       ├── _layout.tsx      # Navegação em abas (Tab navigator)
│       ├── index.tsx        # Dashboard
│       ├── agenda.tsx       # Agenda de eventos
│       ├── historico.tsx    # Histórico clínico
│       └── perfil.tsx       # Configurações do perfil
├── context/
│   └── PetContext.tsx       # Context API global
├── storage/
│   └── petStorage.ts        # Persistência AsyncStorage
├── types/
│   └── index.ts             # Interfaces do domínio (Pet e Evento)
├── constants/
│   └── index.ts             # Constantes globais
├── app.json                 # Configurações do Expo
├── package.json             # Dependências do projeto
└── tsconfig.json            # Configuração TypeScript
```

---

## Arquitetura de Software

### Persistência de Dados
Todos os dados são salvos localmente no dispositivo utilizando a biblioteca `@react-native-async-storage/async-storage`. A restauração ocorre automaticamente na inicialização do aplicativo.

| Chave de Armazenamento | Descrição dos Dados |
|---|---|
| `@petcare:pet` | Dados cadastrais do animal (nome, espécie, raça, nascimento, peso) |
| `@petcare:eventos` | Lista integral de eventos de saúde e histórico clínico |
| `@petcare:onboarding` | Indicador de conclusão do cadastro inicial |
| `@petcare:notificacoes` | Configurações e preferências do usuário |

### Gerenciamento de Estado
O estado global da aplicação é gerenciado nativamente através da Context API (`PetContext`), expondo a seguinte estrutura:

```typescript
{
  pet: Pet | null;
  eventos: Evento[];
  preferencias: Record<string, boolean>;
  onboardingConcluido: boolean;
  carregando: boolean;
  salvarNovoPet: (pet: Pet) => Promise<void>;
  adicionarEvento: (evento: Evento) => Promise<void>;
  concluirEvento: (id: string) => Promise<void>;
  removerEvento: (id: string) => Promise<void>;
  atualizarPreferencias: (prefs: Record<string, boolean>) => Promise<void>;
  resetar: () => Promise<void>;
}
```

### Modelagem de Dados

```typescript
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

## Configuração e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes (NPM ou Yarn)
- Expo CLI (`npm install -g expo-cli`)
- Aplicativo Expo Go no dispositivo físico ou emulador (Android/iOS) devidamente configurado

### Instruções de Instalação

1. Clone o repositório do projeto:
```bash
git clone https://github.com/Challenge-2TDSPG-2026/Mobile-Application-Development.git
cd Mobile-Application-Development
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor local:
```bash
npx expo start
```

### Execução no Dispositivo

Para iniciar o aplicativo via linha de comando:

```bash
# Para Android (emulador ou dispositivo físico via Expo Go)
npm run android

# Para iOS (exclusivo para ambiente macOS)
npm run ios
```

---

## Detalhamento das Interfaces

- **Onboarding:** Formulário com validação restrita de dados (Bean Validation mobile), exigindo preenchimento de nome, raça, data de nascimento formatada (DD/MM/AAAA) e peso numérico.
- **Dashboard:** Apresentação da interface inicial com painéis totalizadores (pendentes, realizados, atrasados), resumo do cadastro e exibição dos 5 eventos mais próximos.
- **Agenda de Saúde:** Navegação em lista com filtros de categorias e situação temporal. Integra botões de ação rápida para conclusão e exclusão de eventos, além de botão flutuante para nova inserção.
- **Formulário de Eventos:** Interface para detalhamento de ocorrências veterinárias com classificação tipada, campos descritivos e seleção de datas.
- **Histórico Clínico:** Visualização estruturada do passado clínico do animal, agrupada mensalmente e acompanhada de indicadores de completude do cronograma de saúde.
- **Configurações do Perfil:** Central de controle contendo o resumo do cadastro, gerenciamento de permissões de notificação e rotina de exclusão de dados da base local.

---

## Atendimento de Requisitos

| Requisito Avaliativo | Status de Conclusão |
|---|---|
| Implementação de roteamento (Expo Router) | Concluído |
| Disponibilização de no mínimo 5 rotas | Concluído (6 rotas entregues) |
| Protótipo visual responsivo e funcional | Concluído |
| Gerenciamento de estado em formulários (useState) | Concluído |
| Persistência local (AsyncStorage) | Concluído |
| Restauração de sessão de usuário | Concluído |
| Demonstração gravada em vídeo | Concluído |
| Controle de versão e repositório (GitHub) | Concluído |
| Documentação técnica (README) | Concluído |

---

## Contextualização do Desafio Corporativo

O desafio técnico proposto pela CLYVO VET almeja a transição da gestão da saúde animal de um paradigma reativo e focado na urgência para uma metodologia preventiva, unificada e contínua.

Este sistema concentra-se na experiência do usuário (tutor do animal), consolidando as informações em um histórico longitudinal. O software possibilita a organização eficiente de intervenções médicas repetitivas e procedimentos essenciais adequados a cada ciclo de vida do paciente.

---

## Autores do Projeto

| Nome | Registro (RM) |
|---|---|
| Arthur Brito da Silva | RM562085 |
| Luiz Felipe Flosi dos Santos | RM563197 |
| Pedro Henrique Brum Lopes | RM571780 |

---

## Informações Adicionais

- **Licenciamento:** Projeto desenvolvido exclusivamente com fins acadêmicos e avaliativos para o FIAP Challenge 2026.
- **Demonstração em Vídeo:** [Acessar apresentação no YouTube](https://youtu.be/j1JywTFRrR4)