import { View } from 'react-native';

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
            <Stack screenOptions={{ headerShown: false }} />
            <ProcessingToast />
          </View>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
