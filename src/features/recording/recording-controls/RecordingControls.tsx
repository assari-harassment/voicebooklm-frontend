import { colors } from '@/src/shared/constants';
import { Button, IconButton, Surface } from 'react-native-paper';

// 型定義
interface RecordingControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onComplete: () => void;
}

// コンポーネント
export function RecordingControls({ isPaused, onTogglePause, onComplete }: RecordingControlsProps) {
  // 一時停止時はアイコン色を灰色に
  const iconColor = isPaused ? colors.text.tertiary : colors.text.primary;

  return (
    <Surface
      className="flex-row items-center px-4 py-4 bg-t-bg-primary border-t border-t-border-secondary"
      elevation={0}
    >
      <IconButton
        icon={isPaused ? 'play' : 'pause'}
        size={24}
        onPress={onTogglePause}
        className="bg-t-bg-tertiary rounded-xl"
        iconColor={iconColor}
      />
      <Button
        mode="contained"
        onPress={onComplete}
        className="ml-3 rounded-xl"
        style={{ flex: 1 }}
        buttonColor={colors.brand[600]}
        contentStyle={{ paddingVertical: 6 }}
        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
      >
        完了してAI整形する
      </Button>
    </Surface>
  );
}
