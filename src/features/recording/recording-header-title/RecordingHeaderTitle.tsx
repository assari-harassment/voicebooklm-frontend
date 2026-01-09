import { View } from 'react-native';
import { Text } from 'react-native-paper';

// ユーティリティ
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 型定義
interface RecordingHeaderTitleProps {
  duration: number;
}

// コンポーネント
export function RecordingHeaderTitle({ duration }: RecordingHeaderTitleProps) {
  return (
    <View className="flex-row items-center px-3 py-2 bg-t-danger-50 rounded-xl border border-t-danger-100">
      <View className="w-2 h-2 rounded-full bg-t-danger-500" />
      <Text variant="labelLarge" className="text-t-danger-700 ml-2">
        {formatTime(duration)}
      </Text>
    </View>
  );
}
