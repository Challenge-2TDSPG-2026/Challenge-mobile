import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PetProvider, usePet } from '../context/PetContext';
import { VetProvider, useVet } from '../context/VetContext';
import { authService } from '../services/authService';

function RootNavigator() {
  const { onboardingConcluido, carregando: carregandoPet } = usePet();
  const { veterinarioAtivo, carregando: carregandoVet } = useVet();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (carregandoPet || carregandoVet) return;

    let cancelado = false;

    async function verificarEredirecionar() {
      const [tipoContaSessao, logoutExplicito] = await Promise.all([
        authService.getTipoContaAtual(),
        authService.estaExplicitamenteDeslogado(),
      ]);
      if (cancelado) return;

      const grupoAtual = segments[0];
      const emAuthScreen = grupoAtual === 'login';
      const emAreaTutor = grupoAtual === '(tutor)';
      const emAreaVet = grupoAtual === '(vet)';
      const emRotaTutor = grupoAtual === 'add-evento' || grupoAtual === 'add-pet';
      const emRotaVet = grupoAtual === 'paciente';
      const tutorLogado =
        onboardingConcluido &&
        (tipoContaSessao === 'tutor' || (tipoContaSessao === null && !logoutExplicito));
      const vetLogado = tipoContaSessao === 'veterinario' && veterinarioAtivo !== null;

      if (vetLogado) {
        if (!emAreaVet && !emRotaVet) router.replace('/(vet)');
        return;
      }

      if (tutorLogado) {
        if (!emAreaTutor && !emRotaTutor) router.replace('/(tutor)');
        return;
      }

      // Ninguém logado — manda para a tela de login única
      if (!emAuthScreen) {
        router.replace('/login');
      }
    }

    verificarEredirecionar();
    return () => { cancelado = true; };
  }, [onboardingConcluido, carregandoPet, carregandoVet, veterinarioAtivo, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tutor)" />
      <Stack.Screen name="(vet)" />
      <Stack.Screen name="add-evento" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen
        name="paciente/[id]"
        options={{
          headerShown: true,
          title: 'Ficha do Paciente',
          headerStyle: { backgroundColor: '#0e3326' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PetProvider>
      <VetProvider>
        <RootNavigator />
      </VetProvider>
    </PetProvider>
  );
}