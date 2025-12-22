import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Surface, Text } from 'react-native-paper';
import type { TokenResponse } from '../src/api/generated/apiSchema';
import { GoogleLogo } from '../src/components/GoogleLogo';
import { colors } from '../src/constants/colors';
import { apiClient } from '../src/services/apiClient';

// Google Sign-In を初期化
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

type FeatureItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  color: string;
  backgroundColor: string;
};

const features: FeatureItem[] = [
  {
    icon: 'microphone',
    title: '簡単な音声入力',
    description: 'ボタン一つで録音開始',
    color: colors.brand[600],
    backgroundColor: colors.brand[100],
  },
  {
    icon: 'auto-fix',
    title: '自動文字起こし',
    description: 'AIが音声をテキスト化',
    color: colors.accent[600],
    backgroundColor: colors.accent[100],
  },
  {
    icon: 'note-text',
    title: 'スマートな整理',
    description: 'AIがタグとフォルダを作成',
    color: colors.success[600],
    backgroundColor: colors.success[100],
  },
];

export default function LoginScreen() {
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
        <View className="items-center mb-12">
          <Surface
            elevation={0}
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.brand[600],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <MaterialCommunityIcons name="microphone" size={40} color={colors.text.inverse} />
          </Surface>
          <Text variant="headlineLarge" className="font-bold text-t-text-primary mb-2">
            VoiceBookLM
          </Text>
          <Text variant="bodyLarge" className="text-t-text-secondary">
            音声からアイデアを記録
          </Text>
        </View>

        {/* Features */}
        <View className="w-full max-w-xs mb-12 gap-4">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-start gap-3">
              <View
                className="w-8 h-8 rounded-lg justify-center items-center mt-0.5"
                style={{ backgroundColor: feature.backgroundColor }}
              >
                <MaterialCommunityIcons name={feature.icon} size={20} color={feature.color} />
              </View>
              <View className="flex-1">
                <Text variant="titleMedium" className="font-bold text-t-text-primary mb-0.5">
                  {feature.title}
                </Text>
                <Text variant="bodyMedium" className="text-t-text-secondary">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Login Button */}
        <View className="w-full max-w-xs">
          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            icon={isLoading ? undefined : () => <GoogleLogo size={20} />}
            contentStyle={{ paddingVertical: 8 }}
            className="rounded-xl border-t-border-primary"
            labelStyle={{ color: colors.text.primary, fontWeight: '500', fontSize: 16 }}
          >
            {isLoading ? <ActivityIndicator animating={true} size="small" /> : 'Googleでログイン'}
          </Button>

          <Text
            variant="bodySmall"
            className="text-center text-t-text-secondary mt-6 px-4 leading-5"
          >
            ログインすることで、
            <Text className="text-t-brand-600 font-medium">利用規約</Text>と
            <Text className="text-t-brand-600 font-medium">プライバシーポリシー</Text>
            に同意したものとみなされます
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
