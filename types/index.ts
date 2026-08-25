export type TipoConta = 'tutor' | 'veterinario';
export interface Pet {
  id: string;
  nome: string;
  especie: 'cachorro' | 'gato' | 'pássaro' | 'outro';
  raca: string;
  dataNascimento: string;
  peso: string;
}
export type StatusEvento = 'solicitado' | 'confirmado' | 'concluido' | 'cancelado';
export type StatusEventoExibicao = StatusEvento | 'atrasado';
export interface Evento {
  id: string;
  petId: string;
  tipo: 'vacina' | 'vermifugo' | 'consulta' | 'medicamento' | 'checkup' | 'outro';
  titulo: string;
  descricao?: string;
  data: string;
  status: StatusEvento;
  criadoEm: string;
  veterinarioId?: string;
  confirmadoEm?: string;
  concluidoEm?: string;
  canceladoEm?: string;
  motivoCancelamento?: string;
  observacoesClinicas?: string;
}
export interface Recompensa {
  id: string;
  petId: string;
  criadaEm: string;
  resgatada: boolean;
  resgatadaEm?: string;
  validadaPorVeterinarioId?: string;
}
export interface Veterinario {
  id: string;
  nome: string;
  crmv: string;
  especialidade: string;
  clinica: string;
  criadoEm: string;
}
export interface FaixaDisponibilidade {
  id: string;
  veterinarioId: string;
  diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
  horaInicio: string; 
  horaFim: string;   
}
export interface BloqueioAgenda {
  id: string;
  veterinarioId: string;
  data: string; 
  motivo?: string;
}