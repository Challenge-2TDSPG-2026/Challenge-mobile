import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PetProvider, usePet } from '../context/PetContext';
import { VetProvider } from '../context/VetContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RootNavigator() {
  const { sessao, autenticado, carregando: carregandoAuth } = useAuth();
  const { onboardingConcluido, carregando: carregandoPet } = usePet();
  const router = useRouter();
  const segments = useSegments();

  const ehTutor = sessao?.perfil === 'TUTOR';
  const ehVeterinario = sessao?.perfil === 'VETERINARIO';

  const carregando = carregandoAuth || (ehTutor && carregandoPet);

  useEffect(() => {
    if (carregando) return;

    const inLogin = segments[0] === 'login';
    const inTutor = segments[0] === '(tutor)';
    const inVet = segments[0] === '(vet)';

    if (!autenticado) {
      if (!inLogin) router.replace('/login');
      return;
    }

    if (ehVeterinario) {
      if (!inVet) router.replace('/(vet)');
      return;
    }

    if (ehTutor) {
      if (!onboardingConcluido) {
        return;
      }
      if (!inTutor) router.replace('/(tutor)');
      return;
    }

    if (!inLogin) router.replace('/login');
  }, [autenticado, ehTutor, ehVeterinario, onboardingConcluido, carregando, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tutor)" />
      <Stack.Screen name="(vet)" />
      <Stack.Screen name="add-evento" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="paciente/[id]" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PetProvider>
          <VetProvider>
            <RootNavigator />
          </VetProvider>
        </PetProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}