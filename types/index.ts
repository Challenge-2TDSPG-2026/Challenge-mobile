export interface Pet {
  id: string;
  nome: string;
  especie: 'cachorro' | 'gato' | 'pássaro' | 'outro';
  raca: string;
  dataNascimento: string;
  peso: string;
}

export interface Evento {
  id: string;
  petId: string;
  tipo: 'vacina' | 'vermifugo' | 'consulta' | 'medicamento' | 'checkup' | 'outro';
  titulo: string;
  descricao?: string;
  data: string;
  status: 'pendente' | 'concluido' | 'atrasado';
  criadoEm: string;
}
