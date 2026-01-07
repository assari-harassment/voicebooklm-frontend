import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout } from '@/src/shared/constants';
import { useProcessingStore } from '@/src/shared/stores/processingStore';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * グローバルフローティング処理トースト
 *
 * 全画面で表示されるフローティングトーストコンポーネント。
 * 処理中・完了・エラー状態を表示し、完了時はタップでメモ詳細へ遷移。
 */
export function ProcessingToast() {
  const insets = useSafeAreaInsets();

  // 処理状態を取得
  const status = useProcessingStore((state) => state.status);
  const memoResult = useProcessingStore((state) => state.memoResult);
  const retry = useProcessingStore((state) => state.retry);
  const dismissBanner = useProcessingStore((state) => state.dismissBanner);

  // アニメーション
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  const isVisible = status !== 'idle';
  const isProcessing = status === 'processing';
  const isError = status === 'error';

  // 破棄確認ダイアログの状態
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // スピナーアニメーション
  useEffect(() => {
    if (isProcessing) {
      const animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
    spinValue.setValue(0);
  }, [isProcessing, spinValue]);

  // 表示/非表示アニメーション
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateY, opacity]);

  // スピナー回転
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 状態に応じたスタイル
  const iconBackgroundColor = isProcessing
    ? colors.brand[50]
    : isError
      ? colors.danger[50]
      : colors.success[50];
  const iconColor = isProcessing
    ? colors.brand[600]
    : isError
      ? colors.danger[600]
      : colors.success[600];

  const getMainText = () => {
    if (isProcessing) return 'AI整形を実行中...';
    if (isError) return 'AI整形に失敗';
    return 'AI整形が完了';
  };

  const getSubText = () => {
    if (isProcessing) return 'バックグラウンドで処理しています';
    if (isError) return '長押しで破棄 / タップで再試行';
    return 'タップして確認する';
  };

  const handlePress = () => {
    if (isProcessing) return;

    if (isError) {
      // エラー時はタップで再試行
      retry();
      return;
    }

    if (status === 'completed' && memoResult) {
      dismissBanner();
      router.push({
        pathname: '/note/[id]',
        params: {
          id: memoResult.memoId,
          memoData: JSON.stringify(memoResult),
        },
      });
    } else {
      dismissBanner();
    }
  };

  // 長押し時のハンドラ（エラー時のみ）
  const handleLongPress = () => {
    if (isError) {
      setShowDiscardDialog(true);
    }
  };

  // 破棄確認
  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    dismissBanner();
  };

  if (!isVisible) return null;

  const toastContent = (
    <View style={styles.toast}>
      {/* アイコン */}
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        {isProcessing ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size={20} color={iconColor} />
          </Animated.View>
        ) : (
          <Icon source={isError ? 'alert-circle' : 'check-circle'} size={24} color={iconColor} />
        )}
      </View>

      {/* テキスト */}
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{getMainText()}</Text>
        <Text style={styles.subText}>{getSubText()}</Text>
      </View>

      {/* 矢印アイコン（タップ可能な時のみ） */}
      {!isProcessing && <Icon source="chevron-right" size={12} color={colors.text.tertiary} />}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + layout.headerHeight,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      {isProcessing ? (
        toastContent
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          {toastContent}
        </TouchableOpacity>
      )}

      {/* 破棄確認ダイアログ */}
      <ConfirmDialog
        visible={showDiscardDialog}
        title="本当に破棄しますか？"
        message="失敗した処理を破棄します。音声データは24時間残りますので、後から再度整形を試すことができます。"
        confirmText="破棄する"
        cancelText="キャンセル"
        variant="danger"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 10,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // シャドウ (iOS)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // シャドウ (Android)
    elevation: 4,
    // サイズ
    minWidth: 210,
    maxWidth: 260,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 4,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#101828',
    lineHeight: 20,
  },
  subText: {
    fontSize: 12,
    color: '#99a1af',
    lineHeight: 16,
    marginTop: 2,
  },
});
