import { View } from 'react-native';

import {
  defaultScreenOptions,
  homeScreenOptions,
  indexScreenOptions,
  loginScreenOptions,
  noteDetailScreenOptions,
  recordScreenOptions,
  searchScreenOptions,
} from '@/src/navigation/screen-options';
import { ProcessingToast } from '@/src/shared/components';
import { AuthProvider } from '@/src/shared/providers/AuthProvider';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={defaultScreenOptions}>
              <Stack.Screen name="index" options={indexScreenOptions} />
              <Stack.Screen name="login" options={loginScreenOptions} />
              <Stack.Screen name="home" options={homeScreenOptions} />
              <Stack.Screen name="search" options={searchScreenOptions} />
              <Stack.Screen name="note/[id]" options={noteDetailScreenOptions} />
              <Stack.Screen name="record" options={recordScreenOptions} />
            </Stack>
            <ProcessingToast />
          </View>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
