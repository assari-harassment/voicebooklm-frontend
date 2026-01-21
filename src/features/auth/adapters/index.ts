/**
 * Google Auth Adapter
 *
 * Platform Extensions により自動的にプラットフォーム固有の実装が選択される:
 * - iOS/Android: @react-native-google-signin/google-signin (googleAuth.native.ts)
 * - Web: @react-oauth/google (googleAuth.web.ts)
 */

export { configureGoogleAuth, signInWithGoogle, type GoogleSignInResult } from './googleAuth';
