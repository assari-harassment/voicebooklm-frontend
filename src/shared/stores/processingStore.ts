import { apiClient } from '@/src/api';
import type { FormatMemoResponse, MemoDetailResponse } from '@/src/api/generated/apiSchema';
import { create } from 'zustand';

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ProcessingState {
  // 状態
  status: ProcessingStatus;
  memoResult: MemoDetailResponse | FormatMemoResponse | null;
  error: string | null;
  transcript: string | null;
  language: string | null;
  memoId: string | null;
  actionType: 'format' | 'resummarize' | null;

  // アクション
  startProcessing: (transcript: string, language?: string) => Promise<void>;
  startResummarize: (memoId: string, editedTranscription: string) => Promise<void>;
  retry: () => Promise<void>;
  setCompleted: (result: MemoDetailResponse | FormatMemoResponse) => void;
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
  memoId: null,
  actionType: null,

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
      memoId: null,
      actionType: 'format',
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

  // 再AI整形を開始（編集済み文字起こし）
  startResummarize: async (memoId: string, editedTranscription: string) => {
    if (get().status === 'processing') {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
      transcript: editedTranscription,
      language: null,
      memoId,
      actionType: 'resummarize',
    });

    try {
      const result = await apiClient.resummarizeMemo(memoId, editedTranscription);

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to resummarize memo:', err);
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
    const { transcript, language, actionType, memoId } = get();
    if (!transcript || !actionType) {
      return;
    }

    set({
      status: 'processing',
      memoResult: null,
      error: null,
    });

    try {
      const result =
        actionType === 'resummarize'
          ? await apiClient.resummarizeMemo(memoId ?? '', transcript)
          : await apiClient.formatMemo(transcript, language ?? 'ja-JP');

      set({
        status: 'completed',
        memoResult: result,
        error: null,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to process memo (retry):', err);
      const errorMessage = err instanceof Error ? err.message : '処理に失敗しました';

      set({
        status: 'error',
        memoResult: null,
        error: errorMessage,
      });
    }
  },

  // 処理完了（手動設定用）
  setCompleted: (result: MemoDetailResponse | FormatMemoResponse) => {
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
      memoId: null,
      actionType: null,
    });
  },

  // バナーを閉じる
  dismissBanner: () => {
    get().reset();
  },
}));
