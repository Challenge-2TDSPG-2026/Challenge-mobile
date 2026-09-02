import { Alert, Platform } from 'react-native';

export function alertar(titulo: string, mensagem?: string): void {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }
  Alert.alert(titulo, mensagem);
}

interface OpcaoConfirmar {
  texto: string;
  estilo?: 'default' | 'cancel' | 'destructive';
  aoConfirmar?: () => void;
}

export function confirmar(titulo: string, mensagem: string, opcoes: OpcaoConfirmar[]): void {
  if (Platform.OS === 'web') {
    const confirmou = window.confirm(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    const opcaoAlvo = confirmou
      ? opcoes.find(o => o.estilo !== 'cancel')
      : opcoes.find(o => o.estilo === 'cancel');
    opcaoAlvo?.aoConfirmar?.();
    return;
  }
  Alert.alert(
    titulo,
    mensagem,
    opcoes.map(o => ({ text: o.texto, style: o.estilo, onPress: o.aoConfirmar }))
  );
}