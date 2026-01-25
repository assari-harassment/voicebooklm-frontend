import { useAudioRecorder } from '@siteed/expo-audio-studio';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, View, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';

import { apiClient } from '@/src/api';
import { ConfirmDialog } from '@/src/shared/components';
import { useProcessingStore } from '@/src/shared/stores/processingStore';
import { useRecordingStore } from '@/src/shared/stores/recordingStore';

import { LiveTranscript } from './components/LiveTranscript';
import { RecordingHeader } from './components/RecordingHeader';
import { RecordingControls } from './recording-controls';
import { streamingTranscriptionService } from './services/StreamingTranscriptionService';

// Base64からArrayBufferに変換
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// WAVヘッダーかどうかを判定 ("RIFF" および "WAVE" シグネチャをチェック)
function isWavHeader(buffer: ArrayBuffer): boolean {
  // "RIFF" (0-3), ChunkSize (4-7), "WAVE" (8-11) を確認するため最低12バイト必要
  if (buffer.byteLength < 12) return false;
  const view = new Uint8Array(buffer);
  // "RIFF" = 0x52, 0x49, 0x46, 0x46 / "WAVE" = 0x57, 0x41, 0x56, 0x45
  const isRiff = view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46;
  const isWave = view[8] === 0x57 && view[9] === 0x41 && view[10] === 0x56 && view[11] === 0x45;
  return isRiff && isWave;
}

// TypedArrayからArrayBufferを抽出（正しいバイト範囲をコピー）
function extractArrayBuffer(typedArray: Uint8Array | Int16Array): ArrayBuffer {
  // 新しいArrayBufferにコピーして返す（SharedArrayBufferを避ける）
  const copy = new Uint8Array(typedArray.byteLength);
  copy.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength));
  return copy.buffer;
}

// Float32ArrayをPCM 16bitに変換
function convertFloat32ToPcm16(float32: Float32Array): ArrayBuffer {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16.buffer;
}

// 音声データをPCM ArrayBufferに変換
function convertToPcmBuffer(data: unknown): ArrayBuffer | null {
  if (!data) {
    return null;
  }

  // Native: Base64文字列
  if (typeof data === 'string') {
    return base64ToArrayBuffer(data);
  }

  // Web: ArrayBuffer直接
  if (data instanceof ArrayBuffer) {
    return data;
  }

  // Web: Uint8Array
  if (data instanceof Uint8Array) {
    return extractArrayBuffer(data);
  }

  // Web: Int16Array - すでにPCM 16bit
  if (data instanceof Int16Array) {
    return extractArrayBuffer(data);
  }

  // Web: Float32Array - PCM 16bitに変換
  if (data instanceof Float32Array) {
    return convertFloat32ToPcm16(data);
  }

  // 未知のフォーマット
  if (__DEV__) {
    console.log(
      '[Recording] Unknown data format:',
      (data as { constructor?: { name?: string } })?.constructor?.name,
      data
    );
  }
  return null;
}

export function RecordingScreen() {
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);

  // useAudioRecorderフック
  const { startRecording, stopRecording, pauseRecording, resumeRecording, isRecording, isPaused } =
    useAudioRecorder();

  // リアルタイム文字起こし状態
  const {
    phase,
    connectionState,
    editableTranscript,
    error: transcriptionError,
    connect,
    startTranscription,
    cancel,
    reset,
    setEditableTranscript,
  } = useRecordingStore();

  // 画面に入ったら自動的に録音開始
  useEffect(() => {
    initializeRecording();
    return () => {
      // 画面離脱時にクリーンアップ
      (async () => {
        try {
          // handleComplete等で既にstopRecording()が呼ばれている場合はエラーを無視
          await stopRecording();
        } catch {
          // 録音が既に停止している場合のエラーは無視
        } finally {
          streamingTranscriptionService.disconnect();
          reset();
        }
      })();
    };
    // NOTE: 録音・文字起こしの初期化は画面マウント時に一度だけ実行したいので依存配列は空のままとする。
    //       initializeRecording 内で参照している関数・値（apiClient, connect など）はマウント中に変化しない前提。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeRecording = async () => {
    try {
      setIsInitializing(true);

      // WebSocket接続
      const token = apiClient.getAccessToken();
      if (!token) {
        throw new Error('認証トークンがありません');
      }

      await connect(token, 'ja-JP');

      // 文字起こし開始
      startTranscription();

      // 音声録音開始
      await startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        ...(Platform.OS !== 'web' && { bufferDurationSeconds: 0.1 }),
        keepAwake: true,
        output: {
          primary: {
            enabled: false, // ファイル保存なし（ストリーミングのみ）
          },
        },
        onAudioStream: async (event) => {
          try {
            if (__DEV__) {
              console.log(
                '[Recording] onAudioStream called, data type:',
                typeof event.data,
                'size:',
                event.eventDataSize
              );
            }

            // PCMデータをWebSocketに送信
            const pcmBuffer = convertToPcmBuffer(event.data);
            if (!pcmBuffer) {
              return;
            }

            // Web環境の場合、追加の処理が必要
            if (Platform.OS === 'web') {
              // WAVヘッダー（44バイト以上でRIFF+WAVEシグネチャ）はスキップ
              if (isWavHeader(pcmBuffer)) {
                if (__DEV__) {
                  console.log('[Recording] Skipping WAV header, size:', pcmBuffer.byteLength);
                }
                return;
              }

              // 小さすぎるチャンクはスキップ（不完全なデータやメタデータの可能性）
              // 最小サイズ: 16kHz × 10ms × 2バイト = 320バイト
              const minChunkSize = 320;
              if (pcmBuffer.byteLength < minChunkSize) {
                if (__DEV__) {
                  console.log('[Recording] Skipping small chunk, size:', pcmBuffer.byteLength);
                }
                return;
              }

              if (__DEV__) {
                console.log(
                  '[Recording] Web: Sending PCM data, size:',
                  pcmBuffer.byteLength,
                  'samples:',
                  pcmBuffer.byteLength / 2
                );
              }
            }

            streamingTranscriptionService.sendAudioChunk(pcmBuffer);
          } catch (err) {
            // データ変換エラーは録音を中断せず、ログ出力のみ
            if (__DEV__) {
              console.error('[Recording] Error processing audio stream:', err);
            }
          }
        },
      });

      setError(null);
      setIsInitializing(false);
    } catch (err) {
      if (__DEV__) console.error('Recording initialization failed:', err);
      setError(err instanceof Error ? err.message : '録音を開始できませんでした');
      setIsInitializing(false);
      Alert.alert('エラー', '録音を開始できませんでした。マイクの権限を確認してください。', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

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
    setIsCancelDialogVisible(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    }
    cancel();
    setDuration(0);
    setIsCancelDialogVisible(false);
    router.back();
  }, [cancel, isRecording, stopRecording]);

  const handleComplete = async () => {
    try {
      setIsProcessing(true);

      // 録音停止
      await stopRecording();

      // WebSocket切断して文字起こしテキストを取得
      const transcript = streamingTranscriptionService.stopWithoutFormat();

      if (transcript && transcript.trim().length > 0) {
        // バックグラウンドでAI整形を開始
        useProcessingStore.getState().startProcessing(transcript, 'ja-JP');
      }

      // ホーム画面に戻る
      router.replace('/home');
    } catch (err) {
      if (__DEV__) console.error('Stop recording failed:', err);
      setIsProcessing(false);
      Alert.alert('エラー', '録音の完了処理に失敗しました');
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  // 処理中の表示
  if (isProcessing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          className="flex-1 bg-t-bg-secondary justify-center items-center"
          style={{ maxWidth: 640, alignSelf: 'center', width: '100%' }}
        >
          <ActivityIndicator size="large" color="#6366f1" />
          <Text variant="bodyLarge" className="text-t-text-primary mt-4">
            {phase === 'stopping'
              ? '録音を停止中...'
              : phase === 'formatting'
                ? 'メモを整形中...'
                : '処理中...'}
          </Text>
          {editableTranscript && (
            <Text
              variant="bodySmall"
              className="text-t-text-tertiary mt-2 px-8 text-center"
              numberOfLines={3}
            >
              {`${editableTranscript.slice(0, 100)}...`}
            </Text>
          )}
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          className="flex-1 bg-t-bg-secondary justify-center items-center p-5"
          style={{ maxWidth: 640, alignSelf: 'center', width: '100%' }}
        >
          <Text variant="bodyLarge" className="text-t-danger-500 mb-5 text-center">
            {error}
          </Text>
        </View>
      </>
    );
  }

  // 初期化中または接続中の表示
  if (isInitializing || phase === 'connecting') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          className="flex-1 bg-t-bg-secondary justify-center items-center"
          style={{ maxWidth: 640, alignSelf: 'center', width: '100%' }}
        >
          <ActivityIndicator size="large" color="#6366f1" />
          <Text variant="bodyLarge" className="text-t-text-primary mt-4">
            文字起こしサービスに接続中...
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-1 bg-t-bg-secondary"
        style={{ maxWidth: 640, alignSelf: 'center', width: '100%' }}
      >
        {/* カスタムヘッダー */}
        <RecordingHeader duration={duration} isPaused={isPaused} onCancel={handleCancel} />

        {/* リアルタイム文字起こし表示（編集可能） */}
        <LiveTranscript
          editableTranscript={editableTranscript}
          onChangeText={setEditableTranscript}
        />

        {/* 接続状態インジケーター */}
        {connectionState !== 'ready' && connectionState !== 'disconnected' && (
          <View className="px-4 py-2 bg-t-warning-100">
            <Text variant="bodySmall" className="text-t-warning-700 text-center">
              {connectionState === 'connecting' && '文字起こしサービスに接続中...'}
              {connectionState === 'connected' && '準備中...'}
              {connectionState === 'error' && '接続エラー'}
            </Text>
          </View>
        )}

        {/* エラー表示 */}
        {transcriptionError && (
          <View className="px-4 py-2 bg-t-danger-100">
            <Text variant="bodySmall" className="text-t-danger-700 text-center">
              {transcriptionError.message}
            </Text>
          </View>
        )}

        {/* コントロール */}
        <RecordingControls
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onComplete={handleComplete}
          isProcessing={isProcessing}
        />
      </View>

      {/* キャンセル確認ダイアログ */}
      <ConfirmDialog
        visible={isCancelDialogVisible}
        title="録音を破棄"
        message="録音を破棄しますか？"
        confirmText="破棄"
        cancelText="キャンセル"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelDialogVisible(false)}
        variant="warning"
      />
    </>
  );
}
