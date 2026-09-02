import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PetProvider, usePet } from '../context/PetContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RootNavigator() {
  const { autenticado, carregando: carregandoAuth } = useAuth();
  const { onboardingConcluido, carregando: carregandoPet } = usePet();
  const router = useRouter();
  const segments = useSegments();

  const carregando = carregandoAuth || carregandoPet;

  useEffect(() => {
    if (carregando) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!autenticado) {
      if (!inOnboarding) router.replace('/onboarding');
      return;
    }

    if (!onboardingConcluido) {
      if (!inOnboarding) router.replace('/onboarding');
      return;
    }

    if (inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [autenticado, onboardingConcluido, carregando, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-evento" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PetProvider>
          <RootNavigator />
        </PetProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}