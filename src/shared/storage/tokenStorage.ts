/**
 * zustand persist 用の StateStorage
 *
 * Platform Extensions により自動的にプラットフォーム固有の実装が選択される:
 * - iOS/Android: expo-secure-store
 * - Web: localStorage
 *
 * 使用箇所:
 * - authStore の persist middleware で認証トークンを安全に保存
 */
export { secureStorage } from './secureStorage';
