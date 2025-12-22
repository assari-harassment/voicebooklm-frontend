import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Text } from 'react-native-paper';

// 型定義
interface ProcessingSpinnerProps {
  status: string;
  duration?: string;
}

// コンポーネント
export function ProcessingSpinner({ status, duration }: ProcessingSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  // スピンアニメーション
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 justify-center items-center px-8">
      {/* アイコンとアニメーション */}
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name="loading" size={64} color={colors.brand[500]} />
      </Animated.View>

      {/* ステータステキスト */}
      <Text variant="headlineSmall" className="text-t-text-primary mt-6 font-semibold">
        {status}
      </Text>

      {/* 録音時間 */}
      {duration && (
        <Text variant="bodyMedium" className="text-t-text-secondary mt-2">
          録音時間: {Math.floor(Number(duration) / 60)}分{Number(duration) % 60}秒
        </Text>
      )}

      {/* 説明テキスト */}
      <Text variant="bodySmall" className="text-t-text-tertiary mt-4 text-center leading-5">
        AIがメモを生成しています{'\n'}
        しばらくお待ちください
      </Text>
    </View>
  );
}
