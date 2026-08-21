export const CORES = {
  primaria: '#0e3326',
  secundaria: '#22a06b',
  destaque: '#3db87e',
  alerta: '#dc3545',
  aviso: '#e67e22',
  info: '#2563eb',
  fundo: '#fafaf8',
  fundoCard: '#FFFFFF',
  fundoSutil: '#f0ece5',
  texto: '#1a1512',
  textoSecundario: '#7a6a5e',
  borda: '#e8e2da',
  success: '#166534',
  successBg: '#dcfce7',
  alertaBg: '#fee2e2',
  avisoBg: '#fef3c7',
  infoBg: '#dbeafe',
};

export const STORAGE_KEYS = {
  PET: '@petcare:pet',
  EVENTOS: '@petcare:eventos',
  ONBOARDING_CONCLUIDO: '@petcare:onboarding',
  NOTIFICACOES: '@petcare:notificacoes',
  SESSAO: '@petcare:sessao',
  RECOMPENSAS: '@petcare:recompensas',
};

// A cada N consultas concluídas, o tutor ganha 1 consulta grátis
export const META_CONSULTAS_RECOMPENSA = 5;

// --- Sistema de Nível/XP ---
export const XP_POR_EVENTO = 10;

export const NIVEIS = [
  { nivel: 1, titulo: 'Iniciante', xpMin: 0 },
  { nivel: 2, titulo: 'Aprendiz', xpMin: 50 },
  { nivel: 3, titulo: 'Cuidador Dedicado', xpMin: 100 },
  { nivel: 4, titulo: 'Cuidador Dedicado', xpMin: 150 },
  { nivel: 5, titulo: 'Guardião Experiente', xpMin: 200 },
  { nivel: 6, titulo: 'Guardião Experiente', xpMin: 250 },
  { nivel: 7, titulo: 'Guardião Experiente', xpMin: 300 },
  { nivel: 8, titulo: 'Mestre Pet', xpMin: 350 },
  { nivel: 9, titulo: 'Mestre Pet', xpMin: 400 },
  { nivel: 10, titulo: 'Lenda do Cuidado', xpMin: 450 },
] as const;

// --- Conquistas (badges) ---
// Todas calculadas a partir de dados que já existem (eventos, recompensas) — nada inventado.
export const CONQUISTAS = [
  {
    id: 'primeiro-cadastro',
    titulo: 'Primeiros Passos',
    descricao: 'Cadastrou seu primeiro pet no ClyvoVet',
    icon: 'paw',
    iconSet: 'MaterialCommunityIcons',
  },
  {
    id: 'primeira-consulta',
    titulo: 'Primeira Consulta',
    descricao: 'Concluiu a primeira consulta veterinária',
    icon: 'medical-bag',
    iconSet: 'MaterialCommunityIcons',
  },
  {
    id: 'cinco-eventos',
    titulo: 'Bom Cuidador',
    descricao: 'Concluiu 5 eventos de saúde',
    icon: 'heart-outline',
    iconSet: 'Ionicons',
  },
  {
    id: 'vinte-eventos',
    titulo: 'Super Cuidador',
    descricao: 'Concluiu 20 eventos de saúde',
    icon: 'heart',
    iconSet: 'Ionicons',
  },
  {
    id: 'vacinacao-em-dia',
    titulo: 'Vacinação em Dia',
    descricao: 'Nenhuma vacina do seu pet está atrasada',
    icon: 'shield-checkmark-outline',
    iconSet: 'Ionicons',
  },
  {
    id: 'sem-atrasos',
    titulo: 'Rotina em Dia',
    descricao: 'Nenhum evento atrasado no momento',
    icon: 'checkmark-done-outline',
    iconSet: 'Ionicons',
  },
  {
    id: 'dez-registros',
    titulo: 'Historiador',
    descricao: 'Registrou 10 eventos de saúde no total',
    icon: 'book-outline',
    iconSet: 'Ionicons',
  },
  {
    id: 'primeiro-resgate',
    titulo: 'Fidelidade Recompensada',
    descricao: 'Resgatou seu primeiro cupom de consulta grátis',
    icon: 'gift',
    iconSet: 'Ionicons',
  },
] as const;

export const ESPECIES = [
  { valor: 'cachorro', label: 'Cão', icon: 'dog', iconSet: 'MaterialCommunityIcons' },
  { valor: 'gato', label: 'Gato', icon: 'cat', iconSet: 'MaterialCommunityIcons' },
  { valor: 'pássaro', label: 'Ave', icon: 'bird', iconSet: 'MaterialCommunityIcons' },
  { valor: 'outro', label: 'Outro', icon: 'paw', iconSet: 'MaterialCommunityIcons' },
] as const;

export const TIPOS_EVENTO = [
  { valor: 'vacina', label: 'Vacina', icon: 'needle', iconSet: 'MaterialCommunityIcons', cor: '#22a06b' },
  { valor: 'vermifugo', label: 'Vermífugo', icon: 'bug-outline', iconSet: 'Ionicons', cor: '#9B59B6' },
  { valor: 'consulta', label: 'Consulta', icon: 'medical-bag', iconSet: 'MaterialCommunityIcons', cor: '#2563eb' },
  { valor: 'medicamento', label: 'Medicamento', icon: 'medkit-outline', iconSet: 'Ionicons', cor: '#e67e22' },
  { valor: 'checkup', label: 'Check-up', icon: 'pulse-outline', iconSet: 'Ionicons', cor: '#1ABC9C' },
  { valor: 'outro', label: 'Outro', icon: 'document-text-outline', iconSet: 'Ionicons', cor: '#7a6a5e' },
] as const;

export const SUGESTOES_TITULO: Record<string, Record<string, string[]>> = {
  vacina: {
    cachorro: ['V8 / V10', 'Antirrábica', 'Gripe Canina', 'Leishmaniose'],
    gato: ['Tríplice Felina (V3)', 'Antirrábica', 'FeLV (Leucemia Felina)', 'Quádrupla Felina'],
    pássaro: ['Doença de Newcastle', 'Reforço anual'],
    outro: ['Vacina de reforço', 'Imunização anual'],
  },
  vermifugo: {
    cachorro: ['Drontal Plus', 'Milbemax', 'Vermifugação trimestral'],
    gato: ['Drontal Gatos', 'Milbemax Gatos', 'Vermifugação semestral'],
    pássaro: ['Vermifugação anual'],
    outro: ['Vermifugação periódica'],
  },
  consulta: {
    cachorro: ['Consulta de rotina', 'Retorno veterinário', 'Dermatologia', 'Cardiologia'],
    gato: ['Consulta de rotina', 'Retorno veterinário', 'Odontologia felina'],
    pássaro: ['Consulta de rotina', 'Exame de plumagem'],
    outro: ['Consulta de rotina', 'Retorno veterinário'],
  },
  medicamento: {
    cachorro: ['Antipulgas mensal', 'Carrapicida', 'Suplemento vitamínico', 'Anti-inflamatório'],
    gato: ['Antipulgas mensal', 'Suplemento renal', 'Probiótico'],
    pássaro: ['Suplemento vitamínico', 'Antibiótico prescrito'],
    outro: ['Medicamento prescrito'],
  },
  checkup: {
    cachorro: ['Check-up anual completo', 'Hemograma', 'Ultrassom abdominal'],
    gato: ['Check-up anual completo', 'Perfil renal', 'Hemograma completo'],
    pássaro: ['Check-up anual', 'Exame de fezes'],
    outro: ['Check-up de rotina'],
  },
  outro: {
    cachorro: ['Banho e tosa', 'Higiene dental', 'Corte de unhas'],
    gato: ['Banho', 'Higiene dental', 'Corte de unhas'],
    pássaro: ['Banho', 'Corte de bico'],
    outro: ['Cuidado geral'],
  },
};