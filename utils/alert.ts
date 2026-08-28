import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export function alertar(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as any);
    return;
  }

  const texto = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length <= 1) {
    window.alert(texto);
    buttons?.[0]?.onPress?.();
    return;
  }

  const botaoCancelar = buttons.find(b => b.style === 'cancel');
  const botaoConfirmar = buttons.find(b => b.style !== 'cancel') ?? buttons[buttons.length - 1];

  const confirmado = window.confirm(texto);
  if (confirmado) {
    botaoConfirmar?.onPress?.();
  } else {
    botaoCancelar?.onPress?.();
  }
}