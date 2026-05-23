import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PetProvider, usePet } from '../context/PetContext';

function RootNavigator() {
  const { onboardingConcluido, carregando } = usePet();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (carregando) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!onboardingConcluido && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingConcluido && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingConcluido, carregando, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-evento" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PetProvider>
      <RootNavigator />
    </PetProvider>
  );
}