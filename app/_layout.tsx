import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PetProvider, usePet } from '../context/PetContext';
import { VetProvider, useVet } from '../context/VetContext';
import { authService } from '../services/authService';
import type { TipoConta } from '../types';

function RootNavigator() {
  const { onboardingConcluido, carregando: carregandoPet } = usePet();
  const { veterinarioAtivo, carregando: carregandoVet } = useVet();
  const router = useRouter();
  const segments = useSegments();

  const [tipoContaSessao, setTipoContaSessao] = useState<TipoConta | null>(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    authService.getTipoContaAtual().then(tipo => {
      setTipoContaSessao(tipo);
      setVerificandoSessao(false);
    });
  }, []);

  useEffect(() => {
    if (carregandoPet || carregandoVet || verificandoSessao) return;

    const grupoAtual = segments[0];
    const emAuthTutor = grupoAtual === 'onboarding';
    const emAuthVet = grupoAtual === 'vet-auth';
    const emAreaTutor = grupoAtual === '(tutor)';
    const emAreaVet = grupoAtual === '(vet)';

    // Compatibilidade: onboarding antigo não gravava Sessão (ver TODOs
    // removidos no onboarding.tsx da Fase 5). Enquanto isso, tratamos
    // "onboarding concluído sem sessão registrada" como tutor logado.
    const tutorLogado = onboardingConcluido && (tipoContaSessao === 'tutor' || tipoContaSessao === null);
    const vetLogado = tipoContaSessao === 'veterinario' && veterinarioAtivo !== null;

    if (vetLogado) {
      if (!emAreaVet) router.replace('/(vet)');
      return;
    }

    if (tutorLogado) {
      if (!emAreaTutor) router.replace('/(tutor)');
      return;
    }

    // Ninguém logado — manda para a tela de auth correspondente
    if (!emAuthTutor && !emAuthVet) {
      router.replace('/onboarding');
    }
  }, [onboardingConcluido, carregandoPet, carregandoVet, verificandoSessao, tipoContaSessao, veterinarioAtivo, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="vet-auth" />
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