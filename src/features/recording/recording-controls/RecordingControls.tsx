import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Surface } from 'react-native-paper';

interface RecordingControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onComplete: () => void;
  isProcessing?: boolean;
}

export function RecordingControls({
  isPaused,
  onTogglePause,
  onComplete,
  isProcessing = false,
}: RecordingControlsProps) {
  return (
    <Surface
      className="px-4 py-4 pb-8 bg-t-bg-primary border-t border-t-border-secondary"
      elevation={0}
    >
      {/* ボタン行 */}
      <View className="flex-row items-center justify-center gap-4">
        {/* 一時停止/再開ボタン */}
        <TouchableOpacity
          onPress={onTogglePause}
          className="items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            backgroundColor: isPaused ? colors.brand[100] : colors.bg.tertiary,
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel={isPaused ? '録音を再開' : '録音を一時停止'}
        >
          <MaterialCommunityIcons
            name={isPaused ? 'play' : 'pause'}
            size={28}
            color={isPaused ? colors.brand[600] : colors.text.primary}
          />
        </TouchableOpacity>

        {/* 完了ボタン */}
        <TouchableOpacity
          onPress={onComplete}
          disabled={isProcessing}
          className="items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            backgroundColor: isProcessing ? colors.brand[100] : colors.brand[600],
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="録音を完了"
        >
          <MaterialCommunityIcons
            name="check"
            size={28}
            color={isProcessing ? colors.brand[500] : colors.text.inverse}
          />
        </TouchableOpacity>
      </View>
    </Surface>
  );
}
