import { apiClient } from '@/src/api';
import type { TokenResponse } from '@/src/api/generated/apiSchema';
import { useAuthStore } from '@/src/shared/stores/authStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { configureGoogleAuth, signInWithGoogle } from './adapters';
import { AppLogo } from './app-logo';
import { FeatureList } from './feature-list';
import { GoogleLoginButton } from './google-login-button';

// コンポーネント
export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  // Google Auth 初期化
  useEffect(() => {
    configureGoogleAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Google Sign-In を実行（プラットフォーム固有の実装が自動選択）
      const result = await signInWithGoogle();

      if (result.success && result.idToken) {
        // バックエンド API で認証
        const tokenResponse = await loginWithBackend(result.idToken);
        handleLoginSuccess(tokenResponse);
      } else if (result.error) {
        handleSignInError(result.error);
      }
    } catch (error) {
      handleUnexpectedError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBackend = async (idToken: string): Promise<TokenResponse> => {
    const tokens = await apiClient.loginWithGoogle(idToken);
    return tokens;
  };

  const handleLoginSuccess = (tokens: TokenResponse) => {
    // useAuthStore.login() でトークンを保存
    // APIクライアントへのトークン設定は AuthProvider で行う
    login(tokens);
    // ホーム画面に遷移（replaceで戻れないようにする）
    router.replace('/home');
  };

  const handleSignInError = (error: {
    code: 'CANCELLED' | 'IN_PROGRESS' | 'PLAY_SERVICES_NOT_AVAILABLE' | 'UNKNOWN';
    message: string;
  }) => {
    switch (error.code) {
      case 'CANCELLED':
        // ユーザーがキャンセル（何もしない）
        break;
      case 'IN_PROGRESS':
        // 既にサインイン処理中（何もしない）
        break;
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        Alert.alert('エラー', 'Google Play Services が利用できません');
        break;
      default:
        Alert.alert('エラー', `サインインに失敗しました: ${error.message}`);
    }
  };

  const handleUnexpectedError = (error: unknown) => {
    if (error instanceof Error) {
      Alert.alert('エラー', error.message);
    } else {
      Alert.alert('エラー', '予期しないエラーが発生しました');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-t-bg-primary">
      <View className="flex-1 justify-center items-center px-6 py-12">
        {/* Logo / Brand */}
        <AppLogo />

        {/* Features */}
        <FeatureList />

        {/* Login Button */}
        <GoogleLoginButton isLoading={isLoading} onPress={handleGoogleSignIn} />
      </View>
    </ScrollView>
  );
}
