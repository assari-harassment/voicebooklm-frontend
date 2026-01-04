import { apiClient } from '@/src/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ErrorView } from './error-view';
import { ProcessingSpinner } from './processing-spinner';

// コンポーネント
export function ProcessingScreen() {
  const { duration, filePath } = useLocalSearchParams<{
    duration: string;
    filePath: string;
  }>();
  const [status, setStatus] = useState('音声ファイルをアップロード中...');
  const [error, setError] = useState<string | null>(null);

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
        if (__DEV__) console.error('Failed to process audio:', err);
        const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';
        setError(errorMessage);
        setStatus('エラーが発生しました');
      }
    };

    processAudio();
  }, [filePath]);

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
        <ErrorView error={error} onRetry={handleRetry} onGoHome={handleGoHome} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-t-bg-primary">
      <ProcessingSpinner status={status} duration={duration} />
    </View>
  );
}
