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

// 前回の確定テキスト長を追跡（差分検出用）
let prevFinalTranscriptLength = 0;

export const useRecordingStore = create<RecordingState>()((set, get) => {
  return {
    // 初期状態
    phase: 'idle',
    connectionState: 'disconnected',
    interimTranscript: '',
    finalTranscripts: [],
    fullTranscript: '',
    editableTranscript: '',
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
      set({ phase: 'stopping' });

      try {
        set({ phase: 'formatting' });
        const result = await streamingTranscriptionService.stopAndFormat();

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
      prevFinalTranscriptLength = 0;
      set({
        phase: 'idle',
        connectionState: 'disconnected',
        interimTranscript: '',
        finalTranscripts: [],
        fullTranscript: '',
        editableTranscript: '',
        error: null,
        memoId: null,
      });
    },

    // リセット
    reset: () => {
      prevFinalTranscriptLength = 0;
      set({
        phase: 'idle',
        connectionState: 'disconnected',
        interimTranscript: '',
        finalTranscripts: [],
        fullTranscript: '',
        editableTranscript: '',
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
streamingTranscriptionService.onStateChange((state: TranscriptionState) => {
  const store = useRecordingStore.getState();
  const currentEditableTranscript = store.editableTranscript;

  // 各確定テキストをトリムして結合
  const newFinalTranscript = state.finalTranscripts.map((t) => t.trim()).join('');

  // 新しい確定テキストがあれば末尾に追記
  let updatedEditableTranscript = currentEditableTranscript;
  if (newFinalTranscript.length > prevFinalTranscriptLength) {
    const newText = newFinalTranscript.slice(prevFinalTranscriptLength).trim();
    if (newText) {
      updatedEditableTranscript = currentEditableTranscript + newText;
    }
    prevFinalTranscriptLength = newFinalTranscript.length;
  }

  useRecordingStore.setState({
    connectionState: state.connectionState,
    interimTranscript: state.interimTranscript,
    finalTranscripts: state.finalTranscripts,
    fullTranscript: state.fullTranscript,
    editableTranscript: updatedEditableTranscript,
    error: state.error,
  });
});
