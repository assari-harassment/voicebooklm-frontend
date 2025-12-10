import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, createContext, useContext } from 'react';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import '../i18n';

import { useColorScheme } from '@/components/useColorScheme';
import { authService, UserInfo } from '@/services/AuthService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * 認証コンテキスト
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  /**
   * 認証状態を確認
   * Requirements: 10.1, 10.2, 10.3, 10.11
   */
  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      // トークンの有効性を確認し、必要に応じてリフレッシュ
      const isValid = await authService.checkAuthState();

      if (isValid) {
        // ユーザー情報を取得
        try {
          const userInfo = await authService.getCurrentUser();
          setUser(userInfo);
          setIsAuthenticated(true);
        } catch {
          // ユーザー情報取得に失敗した場合はログアウト
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * サインアウト
   */
  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  /**
   * 認証状態を更新
   */
  const refreshAuth = async () => {
    await checkAuthState();
  };

  // アプリ起動時に認証状態を確認
  useEffect(() => {
    checkAuthState();
  }, []);

  // 認証状態に基づいてルーティング
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // 未認証かつログイン画面以外にいる場合、ログイン画面へリダイレクト
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // 認証済みかつログイン画面にいる場合、メイン画面へリダイレクト
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  const authContextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: '設定', presentation: 'modal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </AuthContext.Provider>
  );
}
