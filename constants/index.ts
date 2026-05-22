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
};

export const ESPECIES = [
  { valor: 'cachorro', label: 'Cão', emoji: '🐶' },
  { valor: 'gato', label: 'Gato', emoji: '🐱' },
  { valor: 'pássaro', label: 'Ave', emoji: '🦜' },
  { valor: 'outro', label: 'Outro', emoji: '🐾' },
] as const;

export const TIPOS_EVENTO = [
  { valor: 'vacina', label: 'Vacina', emoji: '💉', cor: '#22a06b' },
  { valor: 'vermifugo', label: 'Vermífugo', emoji: '🪱', cor: '#9B59B6' },
  { valor: 'consulta', label: 'Consulta', emoji: '🏥', cor: '#2563eb' },
  { valor: 'medicamento', label: 'Medicamento', emoji: '💊', cor: '#e67e22' },
  { valor: 'checkup', label: 'Check-up', emoji: '🩺', cor: '#1ABC9C' },
  { valor: 'outro', label: 'Outro', emoji: '📋', cor: '#7a6a5e' },
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