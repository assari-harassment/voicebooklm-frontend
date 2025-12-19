import { Paths, File } from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, StyleSheet, View } from "react-native";
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
      <View style={[styles.container, styles.errorContainer]}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <Surface style={styles.header} elevation={0}>
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={handleCancel}
          style={styles.backButton}
          accessibilityLabel="戻る"
        />
        <View style={styles.timerContainer}>
          <View style={styles.recordingDot} />
          <Text variant="labelLarge" style={styles.timerText}>
            {formatTime(duration)}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </Surface>

      {/* 波形表示エリア */}
      <View style={styles.waveformSection}>
        <Surface style={styles.waveformCard} elevation={1}>
          <View style={styles.waveformContainer}>
            <Animated.View
              style={[
                styles.waveformBars,
                {
                  transform: [
                    {
                      translateX: Animated.add(
                        scrollX,
                        (VISIBLE_BARS + 5) * BAR_TOTAL_WIDTH
                      ),
                    },
                  ],
                },
              ]}
            >
              {waveformData.map((height, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: Math.max(4, height),
                      opacity: isPaused ? 0.5 : 0.9,
                      backgroundColor: isPaused ? "#6B7280" : "#3B82F6",
                    },
                  ]}
                />
              ))}
            </Animated.View>
          </View>

          {/* 録音中/一時停止のステータス */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPaused ? "#6B7280" : "#EF4444" },
              ]}
            />
            <Text variant="bodySmall" style={styles.statusText}>
              {isPaused ? "一時停止中" : "録音中"}
            </Text>
          </View>
        </Surface>
      </View>

      {/* 空白エリア（文字起こしなし） */}
      <View style={styles.spacer} />

      {/* コントロール */}
      <Surface style={styles.controls} elevation={0}>
        <IconButton
          icon={isPaused ? "play" : "pause"}
          size={24}
          onPress={handleTogglePause}
          style={styles.pauseButton}
          iconColor="#374151"
        />
        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.completeButton}
          contentStyle={styles.completeButtonContent}
          labelStyle={styles.completeButtonLabel}
        >
          完了して要約する
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  timerText: {
    color: "#B91C1C",
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  waveformSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  waveformCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  waveformContainer: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    width: VISIBLE_BARS * BAR_TOTAL_WIDTH,
    overflow: "hidden",
  },
  waveformBars: {
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_MARGIN,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: "#6B7280",
    marginLeft: 6,
  },
  spacer: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  pauseButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  completeButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },
  completeButtonContent: {
    paddingVertical: 6,
  },
  completeButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
