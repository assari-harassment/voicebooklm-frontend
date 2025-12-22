import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

// 型定義
interface ErrorViewProps {
  error: string;
  onRetry: () => void;
  onGoHome: () => void;
}

// コンポーネント
export function ErrorView({ error, onRetry, onGoHome }: ErrorViewProps) {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.danger[500]} />
      <Text variant="headlineSmall" className="text-t-text-primary mt-6 font-semibold">
        エラーが発生しました
      </Text>
      <Text variant="bodyMedium" className="text-t-danger-500 mt-2 text-center">
        {error}
      </Text>
      <View className="mt-8 w-full gap-3">
        <Button mode="contained" onPress={onRetry} className="bg-t-brand-600">
          再度録音する
        </Button>
        <Button mode="outlined" onPress={onGoHome} className="border-t-border-primary">
          ホームに戻る
        </Button>
      </View>
    </View>
  );
}
