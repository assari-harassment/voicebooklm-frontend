import type { VoiceMemoCreatedResponse } from '@/src/api/generated/apiSchema';
import { apiClient } from '@/src/api';
import { create } from 'zustand';

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ProcessingState {
  // 状態
  status: ProcessingStatus;
  memoResult: VoiceMemoCreatedResponse | null;
  error: string | null;
  filePath: string | null;
  language: string | null;

  // アクション
  startProcessing: (filePath: string, language?: string) => Promise<void>;
  retry: () => Promise<void>;
  setCompleted: (result: VoiceMemoCreatedResponse) => void;
  setError: (error: string) => void;
  reset: () => void;
  dismissBanner: () => void;
}

export const useProcessingStore = create<ProcessingState>()((set, get) => ({
  // 初期状態
  status: 'idle',
  memoResult: null,
  error: null,
  filePath: null,
  language: null,

  // 処理開始（バックグラウンドでAPI呼び出し）
  startProcessing: async (filePath: string, language = 'ja-JP') => {
    // 既に処理中の場合は何もしない
    if (get().status === 'processing') {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
      filePath,
      language,
    });

    try {
      // APIを呼び出してメモを生成
      const result = await apiClient.createMemoFromAudio(filePath, language);

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to process audio:', err);
      const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';

      set({
        status: 'error',
        memoResult: null,
        error: errorMessage,
      });
    }
  },

  // 再試行
  retry: async () => {
    const { filePath, language } = get();
    if (!filePath) {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
    });

    try {
      const result = await apiClient.createMemoFromAudio(filePath, language ?? 'ja-JP');

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to process audio (retry):', err);
      const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';

      set({
        status: 'error',
        memoResult: null,
        error: errorMessage,
      });
    }
  },

  // 処理完了（手動設定用）
  setCompleted: (result: VoiceMemoCreatedResponse) => {
    set({
      status: 'completed',
      memoResult: result,
      error: null,
    });
  },

  // エラー発生
  setError: (error: string) => {
    set({
      status: 'error',
      memoResult: null,
      error,
    });
  },

  // 状態リセット（新規録音開始時）
  reset: () => {
    set({
      status: 'idle',
      memoResult: null,
      error: null,
      filePath: null,
      language: null,
    });
  },

  // バナーを閉じる
  dismissBanner: () => {
    get().reset();
  },
}));
