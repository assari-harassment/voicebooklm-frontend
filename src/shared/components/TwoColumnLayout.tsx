import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { FolderList } from '@/src/features/home/folder-list';

interface TwoColumnLayoutProps {
  children: ReactNode;
  /** メインコンテンツの最大幅（デフォルト: 896） */
  maxContentWidth?: number;
  /**
   * ヘッダーが透明かどうか（デフォルト: false）
   * - true: ヘッダーがコンテンツに重なる → サイドバーにpaddingTopを適用
   * - false: ヘッダーの下からコンテンツが始まる → paddingTop不要
   */
  headerTransparent?: boolean;
}

/**
 * 2カラムレイアウトコンポーネント
 * - デスクトップ: 左にフォルダリスト（固定サイドバー）、右にメインコンテンツ
 * - モバイル: メインコンテンツのみ（シングルカラム）
 */
export function TwoColumnLayout({
  children,
  maxContentWidth = 896,
  headerTransparent = false,
}: TwoColumnLayoutProps) {
  const headerHeight = useHeaderHeight();

  const handleMemoClick = (memoId: string) => {
    router.push(`/note/${memoId}`);
  };

  // headerTransparent: true の場合のみ、サイドバーにヘッダー分のpaddingを適用
  const sidebarPaddingTop = headerTransparent ? headerHeight + 16 : 16;

  return (
    <View style={styles.container} className="bg-t-bg-secondary">
      <View style={styles.row} className="md:flex-row">
        {/* サイドバー: デスクトップのみ表示 */}
        <View
          style={styles.sidebar}
          className="hidden md:flex border-r border-t-border-primary bg-t-bg-primary"
        >
          <ScrollView
            style={styles.sidebarScroll}
            contentContainerStyle={{
              paddingTop: sidebarPaddingTop,
              paddingBottom: 16,
            }}
          >
            <FolderList onMemoClick={handleMemoClick} isSidebar />
          </ScrollView>
        </View>

        {/* メインコンテンツ */}
        <View style={[styles.mainContent, { maxWidth: maxContentWidth }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Webでは100dvhで高さを明示的に設定
    ...(Platform.OS === 'web' && {
      height: '100dvh' as unknown as number,
      minHeight: '100dvh' as unknown as number,
    }),
  },
  row: {
    flex: 1,
    overflow: 'hidden',
    // Webでは高さを継承
    ...(Platform.OS === 'web' && {
      height: '100%' as unknown as number,
    }),
  },
  sidebar: {
    width: 288, // md:w-72 = 18rem = 288px
    overflow: 'hidden',
  },
  sidebarScroll: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
    // Webでは高さを継承
    ...(Platform.OS === 'web' && {
      height: '100%' as unknown as number,
    }),
  },
});
