export interface GoogleSignInResult {
  success: boolean;
  idToken?: string;
  error?: {
    code: 'CANCELLED' | 'IN_PROGRESS' | 'PLAY_SERVICES_NOT_AVAILABLE' | 'UNKNOWN';
    message: string;
  };
}

// Google OAuth ライブラリの状態
let googleAuthLoaded = false;

// グローバルに resolve/reject を保持
let currentResolve: ((result: GoogleSignInResult) => void) | null = null;

/**
 * Google Sign-In の設定（Web 向け）
 * Google Identity Services をロードして初期化
 */
export function configureGoogleAuth(): void {
  if (typeof window === 'undefined') return;
  if (googleAuthLoaded) return;

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    console.error('[GoogleAuth] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set');
    return;
  }

  // Google Identity Services スクリプトを動的にロード
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    googleAuthLoaded = true;
    initializeGoogleAuth(clientId);
  };
  document.head.appendChild(script);
}

function initializeGoogleAuth(clientId: string): void {
  if (typeof google === 'undefined') return;

  // ID Token を取得するためのコールバック設定
  google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse,
  });
}

function handleCredentialResponse(response: google.accounts.id.CredentialResponse): void {
  if (currentResolve && response.credential) {
    currentResolve({
      success: true,
      idToken: response.credential,
    });
    currentResolve = null;
  }
}

/**
 * Google Sign-In を実行（Web 向け）
 * ポップアップを表示して認証
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'ブラウザ環境でのみ利用可能です',
      },
    };
  }

  if (!googleAuthLoaded || typeof google === 'undefined') {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Google 認証が初期化されていません',
      },
    };
  }

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Google Client ID が設定されていません',
      },
    };
  }

  return new Promise((resolve) => {
    currentResolve = resolve;

    // FedCM/One Tap は localhost で動作しないため、直接ポップアップを使用
    showSignInPopup(clientId, resolve);
  });
}

function showSignInPopup(clientId: string, resolve: (result: GoogleSignInResult) => void): void {
  // OAuth 2.0 Authorization Code Flow (Popup)
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', window.location.origin + '/auth/callback');
  authUrl.searchParams.set('response_type', 'id_token');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('nonce', generateNonce());

  const popup = window.open(
    authUrl.toString(),
    'google_signin',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    resolve({
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'ポップアップがブロックされました',
      },
    });
    return;
  }

  // ポップアップからのメッセージを待機
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.idToken) {
      window.removeEventListener('message', handleMessage);
      popup.close();
      resolve({
        success: true,
        idToken: event.data.idToken,
      });
    } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
      window.removeEventListener('message', handleMessage);
      popup.close();
      resolve({
        success: false,
        error: {
          code: 'UNKNOWN',
          message: event.data?.message || '認証に失敗しました',
        },
      });
    }
  };

  window.addEventListener('message', handleMessage);

  // ポップアップが閉じられた場合のハンドリング
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
      // メッセージが来なかった場合はキャンセル扱い
      if (currentResolve === resolve) {
        resolve({
          success: false,
          error: {
            code: 'CANCELLED',
            message: 'ユーザーがキャンセルしました',
          },
        });
        currentResolve = null;
      }
    }
  }, 500);
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Google Identity Services の型定義
declare global {
  namespace google.accounts.id {
    interface CredentialResponse {
      credential: string;
      select_by: string;
    }
    interface PromptNotification {
      isNotDisplayed(): boolean;
      isSkippedMoment(): boolean;
      isDismissedMoment(): boolean;
      getDismissedReason(): string;
    }
    function initialize(config: {
      client_id: string;
      callback: (response: CredentialResponse) => void;
    }): void;
    function prompt(callback?: (notification: PromptNotification) => void): void;
  }
  namespace google.accounts.oauth2 {
    interface TokenClient {
      requestAccessToken(): void;
    }
  }
}
