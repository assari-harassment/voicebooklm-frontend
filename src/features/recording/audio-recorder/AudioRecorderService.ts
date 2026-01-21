import {
  ExpoAudioStreamModule,
  AudioRecording,
  RecordingConfig,
  AudioDataEvent,
} from '@siteed/expo-audio-studio';
import { streamingTranscriptionService } from '../services/StreamingTranscriptionService';

// Google Speech to Text推奨設定: LINEAR16, 16kHz, mono
const SAMPLE_RATE = 16000;
const BUFFER_DURATION_SECONDS = 0.1; // 100ms (iOS最小値)

// 型定義
export interface RecordingResult {
  fileUri: string;
  duration: number;
  transcript: string;
}

export interface AudioLevel {
  level: number; // 0-100の正規化された音量レベル
}

type AudioLevelCallback = (data: AudioLevel) => void;
type AudioChunkCallback = (pcmData: ArrayBuffer) => void;

// サービスクラス
class AudioRecorderService {
  private isRecording = false;
  private isPaused = false;
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private audioLevelCallbacks: AudioLevelCallback[] = [];
  private audioChunkCallbacks: AudioChunkCallback[] = [];
  private lastRecordingResult: AudioRecording | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await ExpoAudioStreamModule.requestPermissionsAsync();
      return result.status === 'granted';
    } catch (error) {
      if (__DEV__) console.error('Permission request failed:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await ExpoAudioStreamModule.getPermissionsAsync();
      return result.status === 'granted';
    } catch (error) {
      if (__DEV__) console.error('Permission check failed:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      if (__DEV__) console.warn('Already recording');
      return;
    }

    // パーミッション確認
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Recording permission not granted');
      }
    }

    const config: RecordingConfig = {
      sampleRate: SAMPLE_RATE,
      channels: 1,
      encoding: 'pcm_16bit',
      bufferDurationSeconds: BUFFER_DURATION_SECONDS,
      enableProcessing: true,
      keepAwake: true,
      output: {
        primary: {
          enabled: false, // ファイル保存なし（ストリーミングのみ）
        },
      },
      onAudioStream: async (event: AudioDataEvent) => {
        if (this.isPaused) return;

        // 音量レベルを計算してコールバック
        if (event.data) {
          const level = this.calculateAudioLevelFromAmplitude(event);
          this.notifyAudioLevel(level);
        }

        // PCMデータをWebSocketに送信
        if (event.data && typeof event.data === 'string') {
          // base64からArrayBufferに変換
          const pcmBuffer = this.base64ToArrayBuffer(event.data);
          this.notifyAudioChunk(pcmBuffer);

          // StreamingTranscriptionServiceに送信
          streamingTranscriptionService.sendAudioChunk(pcmBuffer);
        }
      },
      onAudioAnalysis: async (analysisEvent) => {
        // 解析データから音量レベルを取得（より精度の高い値）
        if (analysisEvent.amplitudeRange) {
          const { max } = analysisEvent.amplitudeRange;
          // 0-100に正規化
          const level = Math.min(100, Math.max(0, Math.abs(max) * 100));
          this.notifyAudioLevel(level);
        }
      },
    };

    const startResult = await ExpoAudioStreamModule.startRecording(config);

    if (!startResult) {
      throw new Error('Failed to start recording');
    }

    this.isRecording = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;

    if (__DEV__) {
      console.log('[AudioRecorderService] Recording started');
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private calculateAudioLevelFromAmplitude(event: AudioDataEvent): number {
    // イベントデータサイズから相対的な音量を推定
    // 注意: これはフォールバック用の簡易推定、より正確な音量はonAudioAnalysisで取得
    const dataSize = event.eventDataSize || 0;
    const expectedSize = SAMPLE_RATE * BUFFER_DURATION_SECONDS * 2; // 16bit = 2bytes
    const ratio = Math.min(1, dataSize / expectedSize);
    return ratio * 50 + 25; // 25-75の範囲に正規化
  }

  private notifyAudioLevel(level: number): void {
    this.audioLevelCallbacks.forEach((callback) => {
      callback({ level });
    });
  }

  private notifyAudioChunk(pcmData: ArrayBuffer): void {
    this.audioChunkCallbacks.forEach((callback) => {
      callback(pcmData);
    });
  }

  pauseRecording(): void {
    if (!this.isRecording || this.isPaused) return;

    ExpoAudioStreamModule.pauseRecording();
    this.isPaused = true;
    this.pauseStartTime = Date.now();

    if (__DEV__) {
      console.log('[AudioRecorderService] Recording paused');
    }
  }

  resumeRecording(): void {
    if (!this.isRecording || !this.isPaused) return;

    ExpoAudioStreamModule.resumeRecording();
    this.isPaused = false;
    this.pausedDuration += Date.now() - this.pauseStartTime;

    if (__DEV__) {
      console.log('[AudioRecorderService] Recording resumed');
    }
  }

  async stopRecording(): Promise<RecordingResult | null> {
    if (!this.isRecording) {
      return null;
    }

    const result = await ExpoAudioStreamModule.stopRecording();
    this.lastRecordingResult = result;

    const duration = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);

    // リセット
    this.isRecording = false;
    this.isPaused = false;
    this.audioLevelCallbacks = [];
    this.audioChunkCallbacks = [];

    if (__DEV__) {
      console.log('[AudioRecorderService] Recording stopped, duration:', duration);
    }

    return {
      fileUri: result?.fileUri || '',
      duration,
      transcript: streamingTranscriptionService.getFinalTranscript(),
    };
  }

  async cancelRecording(): Promise<void> {
    if (!this.isRecording) return;

    await ExpoAudioStreamModule.stopRecording();

    // リセット
    this.isRecording = false;
    this.isPaused = false;
    this.audioLevelCallbacks = [];
    this.audioChunkCallbacks = [];

    if (__DEV__) {
      console.log('[AudioRecorderService] Recording cancelled');
    }
  }

  onAudioLevel(callback: AudioLevelCallback): () => void {
    this.audioLevelCallbacks.push(callback);
    return () => {
      const index = this.audioLevelCallbacks.indexOf(callback);
      if (index > -1) {
        this.audioLevelCallbacks.splice(index, 1);
      }
    };
  }

  onAudioChunk(callback: AudioChunkCallback): () => void {
    this.audioChunkCallbacks.push(callback);
    return () => {
      const index = this.audioChunkCallbacks.indexOf(callback);
      if (index > -1) {
        this.audioChunkCallbacks.splice(index, 1);
      }
    };
  }

  getRecordingState(): { isRecording: boolean; isPaused: boolean } {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
    };
  }

  getCurrentDuration(): number {
    if (!this.isRecording) return 0;
    const elapsed = Date.now() - this.startTime;
    const paused = this.isPaused
      ? this.pausedDuration + (Date.now() - this.pauseStartTime)
      : this.pausedDuration;
    return Math.floor((elapsed - paused) / 1000);
  }
}

// シングルトンインスタンス
export const audioRecorderService = new AudioRecorderService();
