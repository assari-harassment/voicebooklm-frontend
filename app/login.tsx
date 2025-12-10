import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/services/AuthService';

// Web ブラウザ認証のクリーンアップ
WebBrowser.maybeCompleteAuthSession();

/**
 * ログイン画面
 *
 * Google OAuth 認証を使用してユーザーをログインさせる。
 * Requirements: 9.1, 9.2, 9.13
 */
export default function LoginScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Expo Go 用に Proxy リダイレクト URI を環境変数から取得（未設定ならデフォルト）
  const redirectUri =
    process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 'https://auth.expo.io/@junhat6/voicebooklm';
  // Expo Go 判定（appOwnership は非推奨のため executionEnvironment を使用）
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

  // Google OAuth 設定
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Expo Go では Web クライアントIDを使用して Proxy フローへ
    clientId: isExpoGo ? webClientId : iosClientId,
    iosClientId: isExpoGo ? undefined : iosClientId,
    androidClientId: isExpoGo ? undefined : androidClientId,
    webClientId,
    redirectUri,
  });

  // Google 認証レスポンスの処理
  useEffect(() => {
    console.log('google response', response);
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        await handleLogin(id_token);
      }
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setError(t('auth.login.error.cancelled'));
      setIsLoading(false);
    }
  };

  /**
   * Google ID トークンでログイン
   */
  const handleLogin = async (idToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.loginWithGoogle(idToken);
      // ログイン成功後、メイン画面へ遷移
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('auth.login.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google ログインボタンタップ
   */
  const handleGoogleLogin = async () => {
    console.log('process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB);
    console.log('request.redirectUri', request?.redirectUri);
    console.log('request.clientId', request?.clientId);
    setIsLoading(true);
    setError(null);

    try {
      await promptAsync();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(t('auth.login.error.generic'));
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ロゴ・タイトル */}
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          {t('auth.login.title')}
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {t('auth.login.subtitle')}
        </Text>
      </View>

      {/* エラーメッセージ */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Google ログインボタン */}
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4285F4" />
        ) : (
          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            disabled={!request || isLoading}
            style={styles.googleButton}
            contentStyle={styles.googleButtonContent}
            labelStyle={styles.googleButtonLabel}
            icon="google"
          >
            {t('auth.login.googleButton')}
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#4285F4',
  },
  googleButtonContent: {
    height: 48,
  },
  googleButtonLabel: {
    fontSize: 16,
  },
});
