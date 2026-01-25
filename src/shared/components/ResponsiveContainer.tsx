import type { ReactNode } from 'react';
import { View } from 'react-native';

interface ResponsiveContainerProps {
  children: ReactNode;
  /** コンテナの最大幅クラス（デフォルト: max-w-4xl） */
  maxWidth?: 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl';
  /** 背景色を含めるか（デフォルト: false） */
  withBackground?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * レスポンシブ対応のコンテナコンポーネント
 * デスクトップでは最大幅を制限し、コンテンツを中央配置
 * モバイルでは幅いっぱいに表示
 */
export function ResponsiveContainer({
  children,
  maxWidth = 'max-w-4xl',
  withBackground = false,
  className = '',
}: ResponsiveContainerProps) {
  return (
    <View
      className={`flex-1 w-full ${maxWidth} self-center ${withBackground ? 'bg-t-bg-secondary' : ''} ${className}`}
    >
      {children}
    </View>
  );
}
