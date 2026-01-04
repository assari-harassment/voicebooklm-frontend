import { AuthLoadingScreen } from '@/src/features/auth';
import { useAuthStore } from '@/src/shared/stores/authStore';
import { Redirect } from 'expo-router';

/**
 * ルートページ - 認証状態に応じてリダイレクト
 */
export default function RootPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  // hydration が完了するまでローディング画面を表示
  if (!isHydrated) {
    return <AuthLoadingScreen />;
  }

  // 認証状態に応じてリダイレクト
  return isAuthenticated ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
