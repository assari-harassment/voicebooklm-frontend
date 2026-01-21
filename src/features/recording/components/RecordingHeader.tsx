import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RecordingHeaderProps {
  duration: number;
  isPaused: boolean;
  onCancel: () => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecordingHeader({ duration, isPaused, onCancel }: RecordingHeaderProps) {
  const insets = useSafeAreaInsets();
  const indicatorOpacity = useRef(new Animated.Value(1)).current;

  // 録音インジケーターの点滅アニメーション
  useEffect(() => {
    if (isPaused) {
      indicatorOpacity.setValue(1);
      return;
    }

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(indicatorOpacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();

    return () => blink.stop();
  }, [isPaused, indicatorOpacity]);

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 bg-t-bg-primary border-b border-t-border-secondary"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* キャンセルボタン */}
      <TouchableOpacity
        onPress={onCancel}
        className="w-10 h-10 items-center justify-center"
        accessibilityLabel="録音をキャンセル"
      >
        <MaterialCommunityIcons name="close" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* 録音インジケーター + 時間 */}
      <View className="flex-row items-center">
        <Animated.View
          className="w-2 h-2 rounded-full mr-2"
          style={{
            backgroundColor: isPaused ? colors.text.tertiary : colors.danger[500],
            opacity: isPaused ? 1 : indicatorOpacity,
          }}
        />
        <Text variant="titleMedium" className="text-t-text-primary font-medium">
          {formatTime(duration)}
        </Text>
      </View>

      {/* 右側のスペーサー（レイアウトバランス用） */}
      <View className="w-10 h-10" />
    </View>
  );
}
