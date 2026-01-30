import { View } from 'react-native';

import {
  defaultScreenOptions,
  homeScreenOptions,
  indexScreenOptions,
  loginScreenOptions,
  noteDetailScreenOptions,
  recordScreenOptions,
  searchScreenOptions,
  settingsScreenOptions,
} from '@/src/navigation/screen-options';
import { ProcessingToast } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';
import { AuthProvider } from '@/src/shared/providers/AuthProvider';
import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={defaultScreenOptions}>
              <Stack.Screen name="index" options={indexScreenOptions} />
              <Stack.Screen name="login" options={loginScreenOptions} />
              <Stack.Screen name="home" options={homeScreenOptions} />
              <Stack.Screen name="search" options={searchScreenOptions} />
              <Stack.Screen name="note/[id]" options={noteDetailScreenOptions} />
              <Stack.Screen name="record" options={recordScreenOptions} />
              <Stack.Screen name="settings" options={settingsScreenOptions} />
            </Stack>
            <ProcessingToast />
          </View>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
