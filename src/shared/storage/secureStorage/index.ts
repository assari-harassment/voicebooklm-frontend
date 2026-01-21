/**
 * Platform-aware Secure Storage
 *
 * Metro Platform Extensions を使用してプラットフォーム固有の実装を自動切り替え:
 * - iOS/Android: expo-secure-store (secureStorage.native.ts)
 * - Web: localStorage (secureStorage.web.ts)
 */

export { secureStorage } from './secureStorage';
