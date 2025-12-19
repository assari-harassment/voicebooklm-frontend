import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { apiClient } from "../src/services/apiClient";

export default function ProcessingScreen() {
  const { duration, filePath } = useLocalSearchParams<{
    duration: string;
    filePath: string;
  }>();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState("音声ファイルをアップロード中...");
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
        setError("録音ファイルが見つかりません");
        return;
      }

      try {
        setStatus("音声ファイルをアップロード中...");

        // APIを呼び出してメモを生成
        const result = await apiClient.createMemoFromAudio(filePath, "ja-JP");

        setStatus("完了！");

        // 少し待ってからメモ詳細画面に遷移
        setTimeout(() => {
          router.replace({
            pathname: "/note/[id]",
            params: {
              id: result.memoId,
              // APIレスポンスをJSON文字列として渡す
              memoData: JSON.stringify(result),
            },
          });
        }, 500);
      } catch (err) {
        console.error("Failed to process audio:", err);
        const errorMessage =
          err instanceof Error ? err.message : "処理に失敗しました";
        setError(errorMessage);
        setStatus("エラーが発生しました");
      }
    };

    processAudio();
  }, [filePath]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRetry = () => {
    setError(null);
    router.replace("/record");
  };

  const handleGoHome = () => {
    router.replace("/home");
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#EF4444"
          />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            エラーが発生しました
          </Text>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.retryButton}
            >
              再度録音する
            </Button>
            <Button mode="outlined" onPress={handleGoHome} style={styles.homeButton}>
              ホームに戻る
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* アイコンとアニメーション */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="loading" size={64} color="#3B82F6" />
        </Animated.View>

        {/* ステータステキスト */}
        <Text variant="headlineSmall" style={styles.statusText}>
          {status}
        </Text>

        {/* 録音時間 */}
        {duration && (
          <Text variant="bodyMedium" style={styles.durationText}>
            録音時間: {Math.floor(Number(duration) / 60)}分
            {Number(duration) % 60}秒
          </Text>
        )}

        {/* 説明テキスト */}
        <Text variant="bodySmall" style={styles.descriptionText}>
          AIがメモを生成しています{"\n"}
          しばらくお待ちください
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statusText: {
    color: "#111827",
    marginTop: 24,
    fontWeight: "600",
  },
  durationText: {
    color: "#6B7280",
    marginTop: 8,
  },
  descriptionText: {
    color: "#9CA3AF",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  errorTitle: {
    color: "#111827",
    marginTop: 24,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 32,
    width: "100%",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#2563EB",
  },
  homeButton: {
    borderColor: "#D1D5DB",
  },
});
