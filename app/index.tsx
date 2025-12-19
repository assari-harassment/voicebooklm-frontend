import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
} from "react-native-paper";
import type { TokenResponse } from "../src/api/generated/apiSchema";
import { apiClient } from "../src/services/apiClient";

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
    icon: "microphone",
    title: "簡単な音声入力",
    description: "ボタン一つで録音開始",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
  },
  {
    icon: "auto-fix",
    title: "自動文字起こし",
    description: "AIが音声をテキスト化",
    color: "#9333EA",
    backgroundColor: "#F3E8FF",
  },
  {
    icon: "note-text",
    title: "スマートな整理",
    description: "AIがタグとフォルダを作成",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
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
          throw new Error("ID トークンを取得できませんでした");
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
    console.log("Login successful, token set");
    // ホーム画面に遷移（replaceで戻れないようにする）
    router.replace("/home");
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
          Alert.alert("エラー", "Google Play Services が利用できません");
          break;
        default:
          Alert.alert("エラー", `サインインに失敗しました: ${error.message}`);
      }
    } else if (error instanceof Error) {
      Alert.alert("エラー", error.message);
    } else {
      Alert.alert("エラー", "予期しないエラーが発生しました");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* Logo / Brand */}
      <View style={styles.brandSection}>
        <Surface style={styles.logoContainer} elevation={4}>
          <MaterialCommunityIcons name="microphone" size={40} color="#FFFFFF" />
        </Surface>
        <Text variant="headlineLarge" style={styles.appName}>
          VoiceBookLM
        </Text>
        <Text variant="bodyLarge" style={styles.tagline}>
          音声からアイデアを記録
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: feature.backgroundColor },
              ]}
            >
              <MaterialCommunityIcons
                name={feature.icon}
                size={20}
                color={feature.color}
              />
            </View>
            <View style={styles.featureText}>
              <Text variant="titleMedium" style={styles.featureTitle}>
                {feature.title}
              </Text>
              <Text variant="bodyMedium" style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Login Button */}
      <View style={styles.loginSection}>
        <Button
          mode="outlined"
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          icon={isLoading ? undefined : "google"}
          contentStyle={styles.buttonContent}
          style={styles.googleButton}
          labelStyle={styles.buttonLabel}
        >
          {isLoading ? (
            <ActivityIndicator animating={true} size="small" />
          ) : (
            "Googleでログイン"
          )}
        </Button>

        <Text variant="bodySmall" style={styles.termsText}>
          ログインすることで、
          <Text style={styles.linkText}>利用規約</Text>と
          <Text style={styles.linkText}>プライバシーポリシー</Text>
          に同意したものとみなされます
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  appName: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  tagline: {
    color: "#6B7280",
  },
  featuresSection: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 48,
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  featureDescription: {
    color: "#6B7280",
  },
  loginSection: {
    width: "100%",
    maxWidth: 320,
  },
  googleButton: {
    borderRadius: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    color: "#111827",
    fontWeight: "500",
    fontSize: 16,
  },
  termsText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "500",
  },
});
