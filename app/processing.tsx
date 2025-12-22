import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { colors } from '../src/constants/colors';
import { apiClient } from '../src/services/apiClient';

export default function ProcessingScreen() {
  const { duration, filePath } = useLocalSearchParams<{
    duration: string;
    filePath: string;
  }>();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState('音声ファイルをアップロード中...');
  const [error, setError] = useState<string | null>(null);

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

  // API呼び出し
  useEffect(() => {
    const processAudio = async () => {
      if (!filePath) {
        setError('録音ファイルが見つかりません');
        return;
      }

      try {
        setStatus('音声ファイルをアップロード中...');

        // APIを呼び出してメモを生成
        const result = await apiClient.createMemoFromAudio(filePath, 'ja-JP');

        setStatus('完了！');

        // 少し待ってからメモ詳細画面に遷移
        setTimeout(() => {
          router.replace({
            pathname: '/note/[id]',
            params: {
              id: result.memoId,
              // APIレスポンスをJSON文字列として渡す
              memoData: JSON.stringify(result),
            },
          });
        }, 500);
      } catch (err) {
        console.error('Failed to process audio:', err);
        const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';
        setError(errorMessage);
        setStatus('エラーが発生しました');
      }
    };

    processAudio();
  }, [filePath]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRetry = () => {
    setError(null);
    router.replace('/record');
  };

  const handleGoHome = () => {
    router.replace('/home');
  };

  if (error) {
    return (
      <View className="flex-1 bg-t-bg-primary">
        <View className="flex-1 justify-center items-center px-8">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={colors.danger[500]}
          />
          <Text variant="headlineSmall" className="text-t-text-primary mt-6 font-semibold">
            エラーが発生しました
          </Text>
          <Text variant="bodyMedium" className="text-t-danger-500 mt-2 text-center">
            {error}
          </Text>
          <View className="mt-8 w-full gap-3">
            <Button mode="contained" onPress={handleRetry} className="bg-t-brand-600">
              再度録音する
            </Button>
            <Button mode="outlined" onPress={handleGoHome} className="border-t-border-primary">
              ホームに戻る
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-t-bg-primary">
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
    </View>
  );
}
