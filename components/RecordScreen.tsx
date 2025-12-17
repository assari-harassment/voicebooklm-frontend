import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { Pause, Play, ArrowLeft } from "lucide-react-native";
import { Audio } from "expo-av";
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  type RecordBackType,
} from "react-native-audio-recorder-player";

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
  const [transcript, setTranscript] = useState("");
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollPosition = useRef(0);
  // AudioRecorderPlayerは既にインスタンス化された定数としてエクスポートされている
  // そのため、useRefで直接参照する
  const recorderPlayerRef = useRef(AudioRecorderPlayer);
  const isRecorderRunning = useRef(false);
  const audioPathRef = useRef<string | null>(null);
  const onStopRef = useRef(onStopRecording);
  const recorderInstance = recorderPlayerRef.current;

  useEffect(() => {
    onStopRef.current = onStopRecording;
  }, [onStopRecording]);

  useEffect(() => {
    recorderInstance.setSubscriptionDuration(0.1);
  }, [recorderInstance]);

  // 画面に入ったら自動的に録音開始
  useEffect(() => {
    if (!isRecording) {
      onStartRecording();
    }
  }, []);

  const ensurePermission = useCallback(async () => {
    if (Platform.OS === "android") {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "マイクへのアクセス",
          message: "音声を録音するためにマイクへのアクセスを許可してください。",
          buttonPositive: "許可する",
        }
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === "ios") {
      // iOS向けの権限要求
      const { status } = await Audio.requestPermissionsAsync();
      return status === "granted";
    }

    // その他のプラットフォーム（webなど）
    return false;
  }, []);

  const startRecorder = useCallback(async () => {
    if (!recorderInstance || isRecorderRunning.current) {
      return;
    }

    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      Alert.alert(
        "マイク権限が必要です",
        "録音を行うには設定からマイクアクセスを許可してください。"
      );
      // 親コンポーネントの状態を更新
      onStopRecording();
      return;
    }

    try {
      // 既存のリスナーを削除（メモリリーク防止）
      recorderInstance.removeRecordBackListener();

      setDuration(0);
      setTranscript("");
      setIsPaused(false);
      setWaveformData([]);
      scrollPosition.current = 0;
      scrollX.setValue(0);

      const audioSet: AudioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: "aac",
      };

      const uri = await recorderInstance.startRecorder(
        undefined,
        audioSet,
        true
      );
      audioPathRef.current = uri;
      isRecorderRunning.current = true;

      recorderInstance.addRecordBackListener((e: RecordBackType) => {
        setDuration(Math.floor(e.currentPosition / 1000));
        return;
      });
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert(
        "録音エラー",
        "録音の開始に失敗しました。もう一度お試しください。"
      );
      // エラー時も親コンポーネントの状態を更新
      onStopRecording();
    }
    // scrollXはAnimated.Valueで参照が変わらないため、依存配列に含める必要はない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensurePermission, onStopRecording]);

  const stopRecorder = useCallback(async () => {
    if (!recorderInstance || !isRecorderRunning.current) {
      return audioPathRef.current;
    }

    let path: string | null = audioPathRef.current;
    try {
      path = await recorderInstance.stopRecorder();
    } catch (error) {
      console.error("Failed to stop recording", error);
    }

    recorderInstance.removeRecordBackListener();
    isRecorderRunning.current = false;
    audioPathRef.current = path;
    return path;
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecorder();
    } else if (isRecorderRunning.current) {
      stopRecorder();
    }
    // startRecorder と stopRecorder は useCallback で定義されており、
    // 依存配列が更新されると参照が変わる可能性がある
    // しかし、isRecording の変更にのみ反応したいため、依存配列から除外する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  useEffect(() => {
    return () => {
      // クリーンアップ時は同期的に処理
      if (isRecorderRunning.current && recorderInstance) {
        // リスナーを削除（同期的）
        recorderInstance.removeRecordBackListener();
        // 状態をリセット（同期的）
        isRecorderRunning.current = false;
        // 録音を停止（非同期だが、完了を待たない）
        void recorderInstance.stopRecorder().catch((error) => {
          // エラーは無視（アンマウント後のエラーは問題ない）
          console.error("Cleanup: Failed to stop recorder", error);
        });
      }
      // 親コンポーネントへのコールバックは削除
      // （アンマウント時に親の状態を変更するのは危険）
    };
  }, [recorderInstance]);

  // 波形データの更新（10ms毎で滑らか）
  const barCount = useRef(0);
  const updateCount = useRef(0);

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

  // 擬似的なリアルタイム文字起こし
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording && !isPaused) {
      let tick = 0;
      interval = setInterval(() => {
        tick += 1;
        if (tick % 3 === 0) {
          const mockPhrases = [
            "これは音声入力のテストです。",
            "今日の会議では重要な決定事項がありました。",
            "プロジェクトの進捗状況について報告します。",
            "新しいアイデアを思いつきました。",
            "この機能は非常に便利だと思います。",
          ];
          const randomPhrase =
            mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
          setTranscript((prev) => prev + (prev ? " " : "") + randomPhrase);
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const resetLocalState = () => {
    setDuration(0);
    setTranscript("");
    setIsPaused(false);
    setWaveformData([]);
    scrollPosition.current = 0;
    scrollX.setValue(0);
  };

  const handleCancel = () => {
    Alert.alert("確認", "録音を破棄しますか?", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "破棄",
        style: "destructive",
        onPress: async () => {
          try {
            // 録音を停止（完了を待つ）
            await stopRecorder();
            // stopRecorder が完了し、isRecorderRunning.current が false になったことを確認
            // その後、親コンポーネントの状態を更新
            onStopRecording();
            resetLocalState();
            onBack();
          } catch (error) {
            console.error("Failed to stop recorder in handleCancel", error);
            // エラーが発生しても、親コンポーネントの状態は更新する
            onStopRecording();
            resetLocalState();
            onBack();
          }
        },
      },
    ]);
  };

  const handleComplete = async () => {
    try {
      // 録音を停止（完了を待つ）
      const path = await stopRecorder();
      // stopRecorder が完了し、isRecorderRunning.current が false になったことを確認
      // その後、親コンポーネントの状態を更新
      onStopRecording();
      const finalTranscript =
        transcript ||
        `録音ファイルを保存しました: ${
          path ?? "アプリ内ストレージに保存されています。"
        }\n\n実際の実装では音声認識APIで文字起こしを行います。`;
      onComplete(finalTranscript, duration);
      resetLocalState();
    } catch (error) {
      console.error("Failed to stop recorder in handleComplete", error);
      // エラーが発生しても、親コンポーネントの状態は更新する
      onStopRecording();
      const finalTranscript =
        transcript ||
        `録音ファイルを保存しました: アプリ内ストレージに保存されています。\n\n実際の実装では音声認識APIで文字起こしを行います。`;
      onComplete(finalTranscript, duration);
      resetLocalState();
    }
  };

  const handleTogglePause = async () => {
    if (!recorderInstance || !isRecorderRunning.current) {
      return;
    }

    try {
      if (isPaused) {
        await recorderInstance.resumeRecorder();
        setIsPaused(false);
      } else {
        await recorderInstance.pauseRecorder();
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Failed to toggle pause", error);
      Alert.alert("一時停止エラー", "録音の一時停止/再開に失敗しました。");
    }
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
          <Text className="text-sm text-red-700 ml-2 leading-none">
            {formatTime(duration)}
          </Text>
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
                    height: Math.max(4, height), // 一時停止時も高さを維持
                    marginHorizontal: BAR_MARGIN,
                    borderRadius: 2,
                    opacity: isPaused ? 0.5 : 0.9,
                    backgroundColor: isPaused ? "#6B7280" : "#3B82F6",
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
            <Text className="text-sm text-gray-600">
              リアルタイム文字起こし
            </Text>
          </View>
          <ScrollView className="flex-1">
            <Text className="text-gray-700 leading-relaxed">
              {transcript || "音声を認識中..."}
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* コントロール */}
      <View className="p-4 flex-row items-center justify-between bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleTogglePause}
          className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center shadow-sm"
        >
          {isPaused ? (
            <Play size={20} color="#374151" />
          ) : (
            <Pause size={20} color="#374151" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleComplete}
          className="flex-1 ml-3 px-6 py-3 bg-blue-600 rounded-xl shadow-lg items-center justify-center"
        >
          <Text className="text-white font-bold text-base">
            完了して要約する
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
