import { Platform } from 'react-native';

/**
 * preciso lembrar de trocar o endereço quando baixar o Java atualizado
(ex: 'http://192.168.0.10:8080').
 */
function resolverBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
}

export const API_BASE_URL = resolverBaseUrl();