import type { FormatMemoResponse } from '@/src/api/generated/apiSchema';
import { apiClient } from '@/src/api';
import { create } from 'zustand';

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ProcessingState {
  // 状態
  status: ProcessingStatus;
  memoResult: FormatMemoResponse | null;
  error: string | null;
  transcript: string | null;
  language: string | null;

  // アクション
  startProcessing: (transcript: string, language?: string) => Promise<void>;
  retry: () => Promise<void>;
  setCompleted: (result: FormatMemoResponse) => void;
  setError: (error: string) => void;
  reset: () => void;
  dismissBanner: () => void;
}

export const useProcessingStore = create<ProcessingState>()((set, get) => ({
  // 初期状態
  status: 'idle',
  memoResult: null,
  error: null,
  transcript: null,
  language: null,

  // 処理開始（バックグラウンドでAPI呼び出し）
  startProcessing: async (transcript: string, language = 'ja-JP') => {
    // 既に処理中の場合は何もしない
    if (get().status === 'processing') {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
      transcript,
      language,
    });

    try {
      // formatMemo APIを呼び出してメモを生成
      const result = await apiClient.formatMemo(transcript, language);

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to format memo:', err);
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
    const { transcript, language } = get();
    if (!transcript) {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
    });

    try {
      const result = await apiClient.formatMemo(transcript, language ?? 'ja-JP');

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to format memo (retry):', err);
      const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';

      set({
        status: 'error',
        memoResult: null,
        error: errorMessage,
      });
    }
  },

  // 処理完了（手動設定用）
  setCompleted: (result: FormatMemoResponse) => {
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
      transcript: null,
      language: null,
    });
  },

  // バナーを閉じる
  dismissBanner: () => {
    get().reset();
  },
}));
