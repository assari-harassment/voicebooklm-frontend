import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HeaderButton } from '@react-navigation/elements';
import { File, Paths } from 'expo-file-system';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useProcessingStore } from '@/src/shared/stores/processingStore';

import { audioRecorderService } from './audio-recorder';
import { AudioWaveform } from './audio-waveform';
import { RecordingControls } from './recording-controls';

// 時間フォーマット用ヘルパー
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// コンポーネント
export function RecordingScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const updateCount = useRef(0);
  const recordingFilePath = useRef<string | null>(null);

  // 画面に入ったら自動的に録音開始
  useEffect(() => {
    startRecording();
    return () => {
      // 画面離脱時にクリーンアップ
      audioRecorderService.cancelRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      // 出力ファイルパスを生成
      const timestamp = Date.now();
      const fileName = `recording_${timestamp}.wav`;
      const file = new File(Paths.document, fileName);
      const filePath = file.uri;
      recordingFilePath.current = filePath;

      await audioRecorderService.startRecording(filePath);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      if (__DEV__) console.error('Recording failed:', err);
      setError(err instanceof Error ? err.message : '録音を開始できませんでした');
      Alert.alert('エラー', '録音を開始できませんでした。マイクの権限を確認してください。', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  // 波形データの更新（実際のオーディオレベルを使用）
  useEffect(() => {
    let waveformInterval: ReturnType<typeof setInterval> | undefined;
    let currentLevel = 0;

    // 実際のオーディオレベルを購読
    const unsubscribe = audioRecorderService.onAudioLevel(({ level }) => {
      currentLevel = level;
    });

    if (isRecording && !isPaused) {
      waveformInterval = setInterval(() => {
        updateCount.current += 1;

        // 5回に1回バーを追加（実際の音量レベルを使用）
        if (updateCount.current % 5 === 0) {
          // 音量レベルを波形の高さに変換（最小10、最大80）
          const height = Math.max(10, Math.min(80, currentLevel * 0.7 + 10));
          setWaveformData((prev) => [...prev, height]);
        }
      }, 10);
    }
    return () => {
      if (waveformInterval) clearInterval(waveformInterval);
      unsubscribe();
    };
  }, [isRecording, isPaused]);

  // 秒数の更新
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const handleCancel = useCallback(() => {
    Alert.alert('確認', '録音を破棄しますか?', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '破棄',
        style: 'destructive',
        onPress: async () => {
          await audioRecorderService.cancelRecording();
          // 録音ファイルを削除
          if (recordingFilePath.current) {
            try {
              const fileToDelete = new File(recordingFilePath.current);
              if (fileToDelete.exists) {
                fileToDelete.delete();
              }
            } catch (e) {
              if (__DEV__) console.warn('Failed to delete recording file:', e);
            }
          }
          setIsRecording(false);
          setDuration(0);
          setWaveformData([]);
          setIsPaused(false);
          router.back();
        },
      },
    ]);
  }, []);

  const handleComplete = async () => {
    try {
      const result = await audioRecorderService.stopRecording();
      setIsRecording(false);

      if (result) {
        // バックグラウンドで処理を開始（エラーはトーストで表示される）
        useProcessingStore
          .getState()
          .startProcessing(result.filePath)
          .catch((err) => {
            if (__DEV__) console.error('Processing failed:', err);
          });
        // ホーム画面に遷移
        router.replace('/home');
      } else {
        Alert.alert('エラー', '録音データの取得に失敗しました');
      }
    } catch (err) {
      if (__DEV__) console.error('Stop recording failed:', err);
      Alert.alert('エラー', '録音の完了処理に失敗しました');
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      audioRecorderService.resumeRecording();
    } else {
      audioRecorderService.pauseRecording();
    }
    setIsPaused(!isPaused);
  };

  if (error) {
    return (
      <View className="flex-1 bg-t-bg-secondary justify-center items-center p-5">
        <Text variant="bodyLarge" className="text-t-danger-500 mb-5 text-center">
          {error}
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitleAlign: 'center',
          title: formatTime(duration),
          headerLeft: ({ tintColor }) => (
            <HeaderButton onPress={handleCancel} accessibilityLabel="録音をキャンセル">
              <MaterialCommunityIcons name="close" size={24} color={tintColor} />
            </HeaderButton>
          ),
          headerBackVisible: false,
        }}
      />
      <View className="flex-1 bg-t-bg-secondary">
        {/* 波形表示エリア */}
        <AudioWaveform waveformData={waveformData} isPaused={isPaused} isRecording={isRecording} />

        {/* 空白エリア（文字起こしなし） */}
        <View className="flex-1" />

        {/* コントロール */}
        <RecordingControls
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onComplete={handleComplete}
        />
      </View>
    </>
  );
}
