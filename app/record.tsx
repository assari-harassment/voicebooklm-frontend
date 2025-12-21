import { Paths, File } from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, View } from "react-native";
import { Button, IconButton, Surface, Text } from "react-native-paper";
import { audioRecorderService } from "../src/services/audioRecorder";

const BAR_WIDTH = 3;
const BAR_MARGIN = 1;
const BAR_TOTAL_WIDTH = BAR_WIDTH + BAR_MARGIN * 2;
const VISIBLE_BARS = 60;

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollPosition = useRef(0);
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
      console.error("Recording failed:", err);
      setError(err instanceof Error ? err.message : "録音を開始できませんでした");
      Alert.alert(
        "エラー",
        "録音を開始できませんでした。マイクの権限を確認してください。",
        [{ text: "OK", onPress: () => router.back() }]
      );
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

        // 滑らかなスクロール
        scrollPosition.current -= BAR_TOTAL_WIDTH / 5;
        scrollX.setValue(scrollPosition.current);

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
  }, [isRecording, isPaused, scrollX]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    Alert.alert("確認", "録音を破棄しますか?", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "破棄",
        style: "destructive",
        onPress: async () => {
          audioRecorderService.cancelRecording();
          // 録音ファイルを削除
          if (recordingFilePath.current) {
            try {
              const fileToDelete = new File(recordingFilePath.current);
              if (fileToDelete.exists) {
                fileToDelete.delete();
              }
            } catch (e) {
              console.warn("Failed to delete recording file:", e);
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
  };

  const handleComplete = async () => {
    try {
      const result = await audioRecorderService.stopRecording();
      setIsRecording(false);

      if (result) {
        // 録音データを処理画面に渡す
        router.replace({
          pathname: "/processing",
          params: {
            duration: duration.toString(),
            filePath: result.filePath,
          },
        });
      } else {
        Alert.alert("エラー", "録音データの取得に失敗しました");
      }
    } catch (err) {
      console.error("Stop recording failed:", err);
      Alert.alert("エラー", "録音の完了処理に失敗しました");
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
      <View className="flex-1 bg-gray-50 justify-center items-center p-5">
        <Text variant="bodyLarge" className="text-red-500 mb-5 text-center">
          {error}
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <Surface className="flex-row justify-between items-center px-2 py-2 bg-white" elevation={0}>
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={handleCancel}
          className="bg-white border border-gray-100"
          accessibilityLabel="戻る"
        />
        <View className="flex-row items-center px-3 py-2 bg-red-50 rounded-xl border border-red-100">
          <View className="w-2 h-2 rounded-full bg-red-500" />
          <Text variant="labelLarge" className="text-red-700 ml-2">
            {formatTime(duration)}
          </Text>
        </View>
        <View className="w-10" />
      </Surface>

      {/* 波形表示エリア */}
      <View className="px-4 pt-4">
        <Surface className="bg-white rounded-2xl p-4 overflow-hidden" elevation={1}>
          <View
            className="h-[120px] flex-row items-center overflow-hidden"
            style={{ width: VISIBLE_BARS * BAR_TOTAL_WIDTH }}
          >
            <Animated.View
              className="flex-row items-center"
              style={{
                transform: [
                  {
                    translateX: Animated.add(
                      scrollX,
                      (VISIBLE_BARS + 5) * BAR_TOTAL_WIDTH
                    ),
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
                    backgroundColor: isPaused ? "#6B7280" : "#3B82F6",
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
              style={{ backgroundColor: isPaused ? "#6B7280" : "#EF4444" }}
            />
            <Text variant="bodySmall" className="text-gray-500 ml-1.5">
              {isPaused ? "一時停止中" : "録音中"}
            </Text>
          </View>
        </Surface>
      </View>

      {/* 空白エリア（文字起こしなし） */}
      <View className="flex-1" />

      {/* コントロール */}
      <Surface className="flex-row items-center px-4 py-4 bg-white border-t border-gray-100" elevation={0}>
        <IconButton
          icon={isPaused ? "play" : "pause"}
          size={24}
          onPress={handleTogglePause}
          className="bg-gray-100 rounded-xl"
          iconColor="#374151"
        />
        <Button
          mode="contained"
          onPress={handleComplete}
          className="flex-1 ml-3 rounded-xl bg-blue-600"
          contentStyle={{ paddingVertical: 6 }}
          labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        >
          完了して要約する
        </Button>
      </Surface>
    </View>
  );
}
