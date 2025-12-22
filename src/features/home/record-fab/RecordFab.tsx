import { colors } from '@/src/shared/constants';
import { FAB } from 'react-native-paper';

// 型定義
interface RecordFabProps {
  onPress: () => void;
}

// コンポーネント
export function RecordFab({ onPress }: RecordFabProps) {
  return (
    <FAB
      icon="microphone"
      color={colors.text.inverse}
      className="absolute bottom-6 self-center bg-t-brand-600 rounded-3xl"
      onPress={onPress}
      accessibilityLabel="録音を開始"
    />
  );
}
