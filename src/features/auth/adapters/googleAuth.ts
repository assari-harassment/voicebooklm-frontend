import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface GoogleSignInResult {
  success: boolean;
  idToken?: string;
  error?: {
    code: 'CANCELLED' | 'IN_PROGRESS' | 'PLAY_SERVICES_NOT_AVAILABLE' | 'UNKNOWN';
    message: string;
  };
}

/**
 * Google Sign-In の設定（Native 向け）
 */
export function configureGoogleAuth(): void {
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

/**
 * Google Sign-In を実行（Native 向け）
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    // Google Play Services の確認（iOSでは自動で成功）
    await GoogleSignin.hasPlayServices();

    // Google Sign-In を実行
    const response = await GoogleSignin.signIn();

    if (isSuccessResponse(response)) {
      const idToken = response.data.idToken;

      if (!idToken) {
        return {
          success: false,
          error: {
            code: 'UNKNOWN',
            message: 'ID トークンを取得できませんでした',
          },
        };
      }

      return {
        success: true,
        idToken,
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'サインインレスポンスが無効です',
      },
    };
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return {
            success: false,
            error: {
              code: 'CANCELLED',
              message: 'ユーザーがキャンセルしました',
            },
          };
        case statusCodes.IN_PROGRESS:
          return {
            success: false,
            error: {
              code: 'IN_PROGRESS',
              message: '既にサインイン処理中です',
            },
          };
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return {
            success: false,
            error: {
              code: 'PLAY_SERVICES_NOT_AVAILABLE',
              message: 'Google Play Services が利用できません',
            },
          };
        default:
          return {
            success: false,
            error: {
              code: 'UNKNOWN',
              message: error.message || '不明なエラーが発生しました',
            },
          };
      }
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
      },
    };
  }
}
