/**
 * デザイントークンカラー定数
 *
 * ⚠️ このファイルは自動生成されます。直接編集しないでください。
 * 色を変更する場合は global.css を編集し、以下のコマンドを実行してください:
 *
 *   npm run generate:colors
 *
 * global.css の CSS変数と同期している色定義です。
 * インラインスタイルや React Native Paper の props で使用する場合は、
 * このファイルからインポートして使用してください。
 *
 * className での使用時は `t-` プレフィックス付きのクラス名を使用してください。
 * 例: className="bg-t-bg-primary text-t-text-secondary"
 */

export const colors = {
  // Background
  bg: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
  },

  // Text
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    tertiary: "#9ca3af",
    inverse: "#ffffff",
  },

  // Border
  border: {
    primary: "#e5e7eb",
    secondary: "#f3f4f6",
  },

  // Brand (Blue - プライマリアクション)
  brand: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },

  // Accent (Purple - 装飾、カテゴリ)
  accent: {
    50: "#faf5ff",
    100: "#f3e8ff",
    500: "#a855f7",
    600: "#9333ea",
  },

  // Success (Green - 成功、完了)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
  },

  // Danger (Red - エラー、削除、録音)
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },

  // Warning (Orange - 警告、注意)
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
  },

  // Info (Cyan - 情報、ヒント)
  info: {
    50: "#ecfeff",
    100: "#cffafe",
    500: "#06b6d4",
    600: "#0891b2",
  },
} as const;

export type Colors = typeof colors;
