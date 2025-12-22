import { colors } from '@/src/shared/constants';
import { View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { GoogleLogo } from './GoogleLogo';

// 型定義
interface GoogleLoginButtonProps {
  isLoading: boolean;
  onPress: () => void;
}

// コンポーネント
export function GoogleLoginButton({ isLoading, onPress }: GoogleLoginButtonProps) {
  return (
    <View className="w-full max-w-xs">
      <Button
        mode="outlined"
        onPress={onPress}
        disabled={isLoading}
        icon={isLoading ? undefined : () => <GoogleLogo size={20} />}
        contentStyle={{ paddingVertical: 8 }}
        className="rounded-xl border-t-border-primary"
        labelStyle={{ color: colors.text.primary, fontWeight: '500', fontSize: 16 }}
      >
        {isLoading ? <ActivityIndicator animating={true} size="small" /> : 'Googleでログイン'}
      </Button>

      <Text variant="bodySmall" className="text-center text-t-text-secondary mt-6 px-4 leading-5">
        ログインすることで、
        <Text className="text-t-brand-600 font-medium">利用規約</Text>と
        <Text className="text-t-brand-600 font-medium">プライバシーポリシー</Text>
        に同意したものとみなされます
      </Text>
    </View>
  );
}
