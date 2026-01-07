import { colors } from '@/src/shared/constants';
import { FAB } from 'react-native-paper';

// 型定義
interface RecordFabProps {
  onPress: () => void;
  disabled?: boolean;
}

// コンポーネント
export function RecordFab({ onPress, disabled = false }: RecordFabProps) {
  return (
    <FAB
      icon="microphone"
      color={disabled ? colors.text.tertiary : colors.text.inverse}
      className={`absolute bottom-6 self-center rounded-3xl ${
        disabled ? 'bg-t-bg-tertiary' : 'bg-t-brand-600'
      }`}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={disabled ? '要約処理中' : '録音を開始'}
    />
  );
}
