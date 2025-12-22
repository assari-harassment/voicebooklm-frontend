import { apiClient } from '@/src/api';
import type { TokenResponse } from '@/src/api/generated/apiSchema';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { AppLogo } from './app-logo';
import { FeatureList } from './feature-list';
import { GoogleLoginButton } from './google-login-button';

// 設定
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// コンポーネント
export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Google Play Services の確認（iOSでは自動で成功）
      await GoogleSignin.hasPlayServices();

      // Google Sign-In を実行
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;

        if (!idToken) {
          throw new Error('ID トークンを取得できませんでした');
        }

        // バックエンド API で認証
        const tokenResponse = await loginWithBackend(idToken);
        handleLoginSuccess(tokenResponse);
      }
    } catch (error) {
      handleSignInError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBackend = async (idToken: string): Promise<TokenResponse> => {
    const tokens = await apiClient.loginWithGoogle(idToken);
    return tokens;
  };

  const handleLoginSuccess = (tokens: TokenResponse) => {
    // アクセストークンをAPIクライアントに設定
    apiClient.setAccessToken(tokens.accessToken);
    // TODO: リフレッシュトークンをセキュアストレージに保存
    console.log('Login successful, token set');
    // ホーム画面に遷移（replaceで戻れないようにする）
    router.replace('/home');
  };

  const handleSignInError = (error: unknown) => {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // ユーザーがキャンセル
          break;
        case statusCodes.IN_PROGRESS:
          // 既にサインイン処理中
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert('エラー', 'Google Play Services が利用できません');
          break;
        default:
          Alert.alert('エラー', `サインインに失敗しました: ${error.message}`);
      }
    } else if (error instanceof Error) {
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
