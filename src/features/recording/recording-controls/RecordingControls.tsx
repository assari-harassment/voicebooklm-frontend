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
        iconColor={colors.text.primary}
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
        完了して要約する
      </Button>
    </Surface>
  );
}
