import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { X, Pause, Play, ArrowLeft } from 'lucide-react-native';

type RecordScreenProps = {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onComplete: (transcript: string, duration: number) => void;
  onBack: () => void;
};

const BAR_WIDTH = 3;
const BAR_MARGIN = 1;
const BAR_TOTAL_WIDTH = BAR_WIDTH + BAR_MARGIN * 2; // 5px per bar
const VISIBLE_BARS = 60; // 表示領域に収まるバー数

export function RecordScreen({
  isRecording,
  onStartRecording,
  onStopRecording,
  onComplete,
  onBack,
}: RecordScreenProps) {
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 画面に入ったら自動的に録音開始
  useEffect(() => {
    if (!isRecording) {
      onStartRecording();
    }
  }, []);

  // 波形データの更新（10ms毎で滑らか）
  const barCount = useRef(0);
  const updateCount = useRef(0);
  const scrollPosition = useRef(0); // 連続的なスクロール位置

  useEffect(() => {
    let waveformInterval: NodeJS.Timeout | undefined;
    if (isRecording && !isPaused) {
      waveformInterval = setInterval(() => {
        updateCount.current += 1;

        // 毎フレーム少しずつスクロール（滑らかに）
        scrollPosition.current -= BAR_TOTAL_WIDTH / 5; // 5フレームで1バー分移動（倍速）
        scrollX.setValue(scrollPosition.current);

        // 5回に1回だけバーを追加（倍速）
        if (updateCount.current % 5 === 0) {
          // 疑似的な音量レベルを生成（実際のアプリではマイクの音量を使用）
          const newVolume = Math.random() * 70 + 10; // 10-80の範囲

          setWaveformData((prev) => {
            // 新しいバーを追加（右端に）- 削除しない
            return [...prev, newVolume];
          });

          barCount.current += 1;
        }
      }, 10); // 10ms毎に更新（非常に滑らか）
    }
    // 一時停止時はintervalを止めるだけで、scrollXはそのまま維持
    return () => {
      if (waveformInterval) clearInterval(waveformInterval);
    };
  }, [isRecording, isPaused]);

  // 秒数と文字起こしの更新
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);

        // リアルタイム文字起こしのシミュレーション
        if (duration % 3 === 0) {
          const mockPhrases = [
            'これは音声入力のテストです。',
            '今日の会議では重要な決定事項がありました。',
            'プロジェクトの進捗状況について報告します。',
            '新しいアイデアを思いつきました。',
            'この機能は非常に便利だと思います。',
          ];
          const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
          setTranscript((prev) => prev + (prev ? ' ' : '') + randomPhrase);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    Alert.alert('確認', '録音を破棄しますか?', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '破棄',
        style: 'destructive',
        onPress: () => {
          onStopRecording();
          setDuration(0);
          setTranscript('');
          setIsPaused(false);
          onBack();
        },
      },
    ]);
  };

  const handleComplete = () => {
    onComplete(
      transcript ||
        'サンプルの文字起こしテキストです。これは録音から生成された内容を表しています。実際の実装では、音声認識APIを使用して文字起こしを行います。',
      duration
    );
    setDuration(0);
    setTranscript('');
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <View className="flex-1 flex-col bg-gray-50">
      {/* ヘッダー */}
      <View className="p-4 flex-row justify-between items-center bg-white">
        <TouchableOpacity
          onPress={handleCancel}
          className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
          accessibilityLabel="戻る"
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center px-3 py-2 bg-red-50 rounded-xl border border-red-100">
          <View className="w-2 h-2 bg-red-500 rounded-full" />
          <Text className="text-sm text-red-700 ml-2 leading-none">{formatTime(duration)}</Text>
        </View>
        <View className="w-10" />
      </View>

      {/* 波形表示（iPhoneボイスメモ風） */}
      <View className="px-4 mb-4 mt-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden">
          <View
            className="h-24 flex-row items-center"
            style={{ width: VISIBLE_BARS * BAR_TOTAL_WIDTH }}
          >
            <Animated.View
              className="flex-row items-center"
              style={{
                // 右端の枠外から始まるようにオフセット
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
                    height: Math.max(4, height), // 一時停止時も高さを維持
                    marginHorizontal: BAR_MARGIN,
                    borderRadius: 2,
                    opacity: isPaused ? 0.5 : 0.9,
                    backgroundColor: isPaused ? '#6B7280' : '#3B82F6',
                  }}
                />
              ))}
            </Animated.View>
          </View>
        </View>
      </View>

      {/* リアルタイム文字起こし */}
      <View className="flex-1 px-4 pb-4">
        <View className="bg-white rounded-xl p-4 flex-1 shadow-sm border border-gray-100">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <Text className="text-sm text-gray-600">リアルタイム文字起こし</Text>
          </View>
          <ScrollView className="flex-1">
            <Text className="text-gray-700 leading-relaxed">{transcript || '音声を認識中...'}</Text>
          </ScrollView>
        </View>
      </View>

      {/* コントロール */}
      <View className="p-4 flex-row items-center justify-between bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleTogglePause}
          className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center shadow-sm"
        >
          {isPaused ? <Play size={20} color="#374151" /> : <Pause size={20} color="#374151" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleComplete}
          className="flex-1 ml-3 px-6 py-3 bg-blue-600 rounded-xl shadow-lg items-center justify-center"
        >
          <Text className="text-white font-bold text-base">完了して要約する</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
