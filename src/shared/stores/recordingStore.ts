import { create } from 'zustand';
import {
  streamingTranscriptionService,
  TranscriptionState,
} from '@/src/features/recording/services/StreamingTranscriptionService';
import { ConnectionState } from '@/src/api/websocketClient';

export type RecordingPhase =
  | 'idle'
  | 'connecting'
  | 'recording'
  | 'stopping'
  | 'formatting'
  | 'completed'
  | 'error';

interface RecordingState {
  // 録音フェーズ
  phase: RecordingPhase;

  // WebSocket接続状態
  connectionState: ConnectionState;

  // 文字起こし結果
  interimTranscript: string;
  finalTranscripts: string[];
  fullTranscript: string;

  // ユーザー編集可能なテキスト
  editableTranscript: string;

  // 前回の確定テキスト長（差分検出用）
  prevFinalTranscriptLength: number;

  // エラー情報
  error: { code: string; message: string } | null;

  // 結果
  memoId: string | null;

  // アクション
  connect: (token: string, language?: string) => Promise<void>;
  startTranscription: () => void;
  stopAndFormat: () => Promise<string>;
  cancel: () => void;
  reset: () => void;
  setEditableTranscript: (text: string) => void;
}

// 購読解除関数を保持
let unsubscribeStateChange: (() => void) | null = null;

export const useRecordingStore = create<RecordingState>()((set, get) => {
  return {
    // 初期状態
    phase: 'idle',
    connectionState: 'disconnected',
    interimTranscript: '',
    finalTranscripts: [],
    fullTranscript: '',
    editableTranscript: '',
    prevFinalTranscriptLength: 0,
    error: null,
    memoId: null,

    // WebSocket接続
    connect: async (token: string, language: string = 'ja-JP') => {
      set({ phase: 'connecting', error: null });

      try {
        await streamingTranscriptionService.connect(token, language);
        set({ phase: 'recording' });
      } catch (error) {
        const message = error instanceof Error ? error.message : '接続に失敗しました';
        set({
          phase: 'error',
          error: { code: 'CONNECTION_ERROR', message },
        });
        throw error;
      }
    },

    // 文字起こし開始
    startTranscription: () => {
      streamingTranscriptionService.startTranscription();
    },

    // 停止して整形
    stopAndFormat: async () => {
      // まず録音停止フェーズに遷移
      set({ phase: 'stopping' });

      try {
        // stopAndFormat内でSTOP送信→500ms待機→API呼び出しが行われる
        // 500ms待機のタイミングでformattingに遷移
        const formattingPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            set({ phase: 'formatting' });
            resolve();
          }, 500);
        });

        // 整形処理と並行してフェーズ遷移
        const [result] = await Promise.all([
          streamingTranscriptionService.stopAndFormat(),
          formattingPromise,
        ]);

        set({
          phase: 'completed',
          memoId: result.memoId,
        });

        return result.memoId;
      } catch (error) {
        const message = error instanceof Error ? error.message : '処理に失敗しました';
        set({
          phase: 'error',
          error: { code: 'FORMAT_ERROR', message },
        });
        throw error;
      }
    },

    // キャンセル
    cancel: () => {
      streamingTranscriptionService.disconnect();
      set({
        phase: 'idle',
        connectionState: 'disconnected',
        interimTranscript: '',
        finalTranscripts: [],
        fullTranscript: '',
        editableTranscript: '',
        prevFinalTranscriptLength: 0,
        error: null,
        memoId: null,
      });
    },

    // リセット
    reset: () => {
      set({
        phase: 'idle',
        connectionState: 'disconnected',
        interimTranscript: '',
        finalTranscripts: [],
        fullTranscript: '',
        editableTranscript: '',
        prevFinalTranscriptLength: 0,
        error: null,
        memoId: null,
      });
    },

    // 編集可能テキストを更新
    setEditableTranscript: (text: string) => {
      set({ editableTranscript: text });
    },
  };
});

// ストア作成後にTranscriptionServiceの状態変更を購読
const setupStateChangeSubscription = () => {
  // 既存の購読があれば解除
  if (unsubscribeStateChange) {
    unsubscribeStateChange();
  }

  unsubscribeStateChange = streamingTranscriptionService.onStateChange(
    (state: TranscriptionState) => {
      const store = useRecordingStore.getState();
      const currentEditableTranscript = store.editableTranscript;
      const prevLength = store.prevFinalTranscriptLength;

      // 各確定テキストをトリムして結合
      const newFinalTranscript = state.finalTranscripts.map((t) => t.trim()).join('');

      // 新しい確定テキストがあれば末尾に追記
      let updatedEditableTranscript = currentEditableTranscript;
      let newPrevLength = prevLength;

      if (newFinalTranscript.length > prevLength) {
        const newText = newFinalTranscript.slice(prevLength).trim();
        if (newText) {
          updatedEditableTranscript = currentEditableTranscript + newText;
        }
        newPrevLength = newFinalTranscript.length;
      }

      useRecordingStore.setState({
        connectionState: state.connectionState,
        interimTranscript: state.interimTranscript,
        finalTranscripts: state.finalTranscripts,
        fullTranscript: state.fullTranscript,
        editableTranscript: updatedEditableTranscript,
        prevFinalTranscriptLength: newPrevLength,
        error: state.error,
      });
    }
  );
};

// 購読を設定
setupStateChangeSubscription();

// 購読解除関数をエクスポート（テスト用など）
export const unsubscribeRecordingStore = () => {
  if (unsubscribeStateChange) {
    unsubscribeStateChange();
    unsubscribeStateChange = null;
  }
};
