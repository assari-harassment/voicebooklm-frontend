import { View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ユーティリティ
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 型定義
interface RecordingTimerProps {
  duration: number;
  onBackPress: () => void;
}

// コンポーネント
export function RecordingTimer({ duration, onBackPress }: RecordingTimerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Surface
      className="flex-row justify-between items-center px-2 bg-t-bg-primary"
      style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
      elevation={0}
    >
      <IconButton
        icon="arrow-left"
        size={20}
        onPress={onBackPress}
        className="bg-t-bg-primary border border-t-border-secondary"
        accessibilityLabel="戻る"
      />
      <View className="flex-row items-center px-3 py-2 bg-t-danger-50 rounded-xl border border-t-danger-100">
        <View className="w-2 h-2 rounded-full bg-t-danger-500" />
        <Text variant="labelLarge" className="text-t-danger-700 ml-2">
          {formatTime(duration)}
        </Text>
      </View>
      <View className="w-10" />
    </Surface>
  );
}
