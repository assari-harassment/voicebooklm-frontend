import {
  transcriptionWebSocket,
  TranscriptionWebSocketCallbacks,
  ConnectionState,
} from '@/src/api/websocketClient';
import { apiClient } from '@/src/api';
import { FormatMemoResponse } from '@/src/api/generated/apiSchema';

export interface TranscriptionState {
  connectionState: ConnectionState;
  interimTranscript: string;
  finalTranscripts: string[];
  fullTranscript: string;
  error: { code: string; message: string } | null;
}

export type TranscriptionStateCallback = (state: TranscriptionState) => void;

class StreamingTranscriptionService {
  private stateCallback: TranscriptionStateCallback | null = null;
  private interimTranscript = '';
  private finalTranscripts: string[] = [];
  private error: { code: string; message: string } | null = null;
  private language = 'ja-JP';

  private get connectionState(): ConnectionState {
    return transcriptionWebSocket.connectionState;
  }

  private get fullTranscript(): string {
    const finals = this.finalTranscripts.join('');
    return finals + (this.interimTranscript ? this.interimTranscript : '');
  }

  onStateChange(callback: TranscriptionStateCallback): () => void {
    this.stateCallback = callback;
    // 現在の状態を即座に通知
    this.notifyState();
    return () => {
      this.stateCallback = null;
    };
  }

  private notifyState(): void {
    if (this.stateCallback) {
      this.stateCallback({
        connectionState: this.connectionState,
        interimTranscript: this.interimTranscript,
        finalTranscripts: this.finalTranscripts,
        fullTranscript: this.fullTranscript,
        error: this.error,
      });
    }
  }

  async connect(token: string, language: string = 'ja-JP'): Promise<void> {
    this.language = language;
    this.reset();

    return new Promise((resolve, reject) => {
      const callbacks: TranscriptionWebSocketCallbacks = {
        onReady: () => {
          if (__DEV__) {
            console.log('[TranscriptionService] Ready');
          }
          this.notifyState();
          resolve();
        },
        onInterim: (transcript: string) => {
          this.interimTranscript = transcript.trim();
          this.notifyState();
        },
        onFinal: (transcript: string) => {
          // 中間結果をクリアし、確定結果を追加（余計なスペースを除去）
          this.interimTranscript = '';
          const trimmedTranscript = transcript.trim();
          if (trimmedTranscript) {
            this.finalTranscripts.push(trimmedTranscript);
          }
          this.notifyState();
        },
        onError: (code: string, message: string) => {
          this.error = { code, message };
          this.notifyState();

          if (this.connectionState === 'connecting') {
            reject(new Error(`${code}: ${message}`));
          }
        },
        onClose: () => {
          this.notifyState();
        },
      };

      transcriptionWebSocket.connect(token, callbacks);

      // タイムアウト設定
      setTimeout(() => {
        if (this.connectionState === 'connecting') {
          transcriptionWebSocket.disconnect();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  startTranscription(): void {
    transcriptionWebSocket.start(this.language);
  }

  sendAudioChunk(pcmData: ArrayBuffer): void {
    if (!transcriptionWebSocket.isReady()) {
      return;
    }
    transcriptionWebSocket.sendAudio(pcmData);
  }

  async stopAndFormat(): Promise<FormatMemoResponse> {
    // STOP送信
    transcriptionWebSocket.stop();

    // 少し待って最後のFINAL結果を受け取る
    await new Promise((resolve) => setTimeout(resolve, 500));

    // WebSocket切断
    transcriptionWebSocket.disconnect();

    const transcript = this.finalTranscripts.join('');

    if (!transcript) {
      throw new Error('No transcription result');
    }

    // Gemini整形APIを呼び出し
    const result = await apiClient.formatMemo(transcript, this.language);

    return result;
  }

  stopWithoutFormat(): string {
    transcriptionWebSocket.stop();
    transcriptionWebSocket.disconnect();
    return this.finalTranscripts.join('');
  }

  stopAndDisconnect(): void {
    transcriptionWebSocket.stop();
    transcriptionWebSocket.disconnect();
  }

  disconnect(): void {
    transcriptionWebSocket.disconnect();
    this.reset();
  }

  private reset(): void {
    this.interimTranscript = '';
    this.finalTranscripts = [];
    this.error = null;
  }

  isConnected(): boolean {
    return transcriptionWebSocket.isConnected();
  }

  isReady(): boolean {
    return transcriptionWebSocket.isReady();
  }

  getTranscript(): string {
    return this.fullTranscript;
  }

  getFinalTranscript(): string {
    return this.finalTranscripts.join('');
  }
}

// シングルトンインスタンス
export const streamingTranscriptionService = new StreamingTranscriptionService();
