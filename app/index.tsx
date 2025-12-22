import { Redirect } from 'expo-router';

/**
 * ルートページ - 認証状態に応じてリダイレクト
 *
 * TODO: 認証状態管理を実装したら、以下のように変更する
 * ```
 * const { isAuthenticated, isLoading } = useAuth();
 * if (isLoading) return <SplashScreen />;
 * return isAuthenticated ? <Redirect href="/home" /> : <Redirect href="/login" />;
 * ```
 */
export default function RootPage() {
  // 現状は未認証として /login にリダイレクト
  return <Redirect href="/login" />;
}
