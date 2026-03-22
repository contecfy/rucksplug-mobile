import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from '@expo-google-fonts/inter';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold
  });

  const initializeAuth = useAuthStore((state) => state.initialize);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeAuth();
      setIsAuthReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if ((loaded || error) && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isAuthReady]);

  if ((!loaded && !error) || !isAuthReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerTitleStyle: {
              fontFamily: 'Inter_700Bold',
            },
            headerBackTitleStyle: {
              fontFamily: 'Inter_400Regular',
            },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new-loan" options={{ headerShown: false }} />
          <Stack.Screen name="loan/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
