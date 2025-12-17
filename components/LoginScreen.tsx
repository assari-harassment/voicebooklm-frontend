import { View, Text, TouchableOpacity } from "react-native";
import { Mic } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";

type User = {
  name: string;
  email: string;
};

type LoginScreenProps = {
  onLogin: (user: User) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleGoogleLogin = () => {
    // 実際のアプリではGoogle OAuth認証を実装
    // ここではモックとしてダミーユーザー情報を生成
    const mockUser: User = {
      name: "Tanaka Taro",
      email: "tanaka.taro@example.com",
    };
    onLogin(mockUser);
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Logo / Brand */}
      <View className="mb-12 items-center w-full">
        <View className="w-20 h-20 mb-6 bg-blue-600 rounded-3xl items-center justify-center shadow-lg">
          <Mic size={40} color="white" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">VoiceMemo</Text>
        <Text className="text-gray-600 text-base">音声からアイデアを記録</Text>
      </View>

      {/* Features */}
      <View className="w-full max-w-sm mb-12 gap-4">
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mt-0.5">
            <Text className="text-blue-600 text-lg">🎤</Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold mb-1 text-base">
              簡単な音声入力
            </Text>
            <Text className="text-sm text-gray-600">ボタン一つで録音開始</Text>
          </View>
        </View>
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mt-0.5">
            <Text className="text-purple-600 text-lg">✨</Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold mb-1 text-base">
              自動文字起こし
            </Text>
            <Text className="text-sm text-gray-600">AIが音声をテキスト化</Text>
          </View>
        </View>
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mt-0.5">
            <Text className="text-green-600 text-lg">📝</Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold mb-1 text-base">
              スマートな整理
            </Text>
            <Text className="text-sm text-gray-600">タグとフォルダで管理</Text>
          </View>
        </View>
      </View>

      {/* Login Button */}
      <View className="w-full max-w-sm">
        <TouchableOpacity
          onPress={handleGoogleLogin}
          className="w-full flex-row items-center justify-center px-6 py-4 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <View className="mr-3">
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <Path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <Path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <Path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </Svg>
          </View>
          <Text className="text-gray-900 font-medium text-base leading-none">
            Googleでログイン
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500 mt-6 px-4">
          ログインすることで、
          <Text className="text-blue-600 font-medium">利用規約</Text>と
          <Text className="text-blue-600 font-medium">
            プライバシーポリシー
          </Text>
          に同意したものとみなされます
        </Text>
      </View>
    </View>
  );
}
