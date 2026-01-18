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
  isPaused: boolean;
}

// コンポーネント
export function RecordingHeaderTitle({ duration, isPaused }: RecordingHeaderTitleProps) {
  // 状態に応じたスタイルを切り替え
  const containerStyle = isPaused
    ? 'bg-t-bg-tertiary border-t-border-primary'
    : 'bg-t-danger-50 border-t-danger-100';
  const dotStyle = isPaused ? 'bg-t-text-tertiary' : 'bg-t-danger-500';
  const textStyle = isPaused ? 'text-t-text-secondary' : 'text-t-danger-700';

  return (
    <View className={`flex-row items-center px-3 py-2 rounded-xl border ${containerStyle}`}>
      <View className={`w-2 h-2 rounded-full ${dotStyle}`} />
      <Text variant="labelLarge" className={`ml-2 ${textStyle}`}>
        {formatTime(duration)}
      </Text>
    </View>
  );
}
