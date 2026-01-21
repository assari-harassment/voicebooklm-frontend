import { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';

/**
 * Google OAuth コールバックページ（Web のみ）
 *
 * Google 認証後のリダイレクト先として機能し、
 * 親ウィンドウに認証結果を postMessage で通知する
 */
export default function AuthCallback() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // URL フラグメントから id_token を取得
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');
    const error = params.get('error');

    if (idToken) {
      // 親ウィンドウに成功を通知
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', idToken }, window.location.origin);
      }
    } else if (error) {
      // 親ウィンドウにエラーを通知
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', message: error },
          window.location.origin
        );
      }
    } else {
      // トークンもエラーもない場合
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', message: '認証情報が取得できませんでした' },
          window.location.origin
        );
      }
    }

    // ポップアップを閉じる（親ウィンドウ側でも閉じるが念のため）
    window.close();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>認証処理中...</Text>
    </View>
  );
}
