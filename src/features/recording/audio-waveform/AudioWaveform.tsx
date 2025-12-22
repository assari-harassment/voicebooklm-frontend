import { colors } from '@/src/shared/constants';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

// 定数
const BAR_WIDTH = 3;
const BAR_MARGIN = 1;
const BAR_TOTAL_WIDTH = BAR_WIDTH + BAR_MARGIN * 2;
const VISIBLE_BARS = 60;

// 型定義
interface AudioWaveformProps {
  waveformData: number[];
  isPaused: boolean;
  isRecording: boolean;
  onWaveformUpdate?: () => void;
}

// フック
function useWaveformScroll(isRecording: boolean, isPaused: boolean) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollPosition = useRef(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        scrollPosition.current -= BAR_TOTAL_WIDTH / 5;
        scrollX.setValue(scrollPosition.current);
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, scrollX]);

  return { scrollX };
}

// コンポーネント
export function AudioWaveform({ waveformData, isPaused, isRecording }: AudioWaveformProps) {
  const { scrollX } = useWaveformScroll(isRecording, isPaused);

  return (
    <View className="px-4 pt-4">
      <Surface className="bg-t-bg-primary rounded-2xl p-4 overflow-hidden" elevation={1}>
        <View
          className="h-[120px] flex-row items-center overflow-hidden"
          style={{ width: VISIBLE_BARS * BAR_TOTAL_WIDTH }}
        >
          <Animated.View
            className="flex-row items-center"
            style={{
              transform: [
                {
                  translateX: Animated.add(scrollX, (VISIBLE_BARS + 5) * BAR_TOTAL_WIDTH),
                },
              ],
            }}
          >
            {waveformData.map((height, i) => (
              <View
                key={i}
                style={{
                  width: BAR_WIDTH,
                  marginHorizontal: BAR_MARGIN,
                  height: Math.max(4, height),
                  opacity: isPaused ? 0.5 : 0.9,
                  backgroundColor: isPaused ? colors.text.secondary : colors.brand[500],
                  borderRadius: 2,
                }}
              />
            ))}
          </Animated.View>
        </View>

        {/* 録音中/一時停止のステータス */}
        <View className="flex-row items-center justify-center mt-3">
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isPaused ? colors.text.secondary : colors.danger[500] }}
          />
          <Text variant="bodySmall" className="text-t-text-secondary ml-1.5">
            {isPaused ? '一時停止中' : '録音中'}
          </Text>
        </View>
      </Surface>
    </View>
  );
}
