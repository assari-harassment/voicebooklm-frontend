import {
  AudioContext,
  AudioRecorder,
  AudioManager,
} from "react-native-audio-api";
import { File } from "expo-file-system";

// Google Speech to Text推奨設定: LINEAR16, 16kHz, mono
const SAMPLE_RATE = 16000;
const BUFFER_LENGTH_IN_SAMPLES = SAMPLE_RATE; // 1秒分のバッファ

export interface RecordingResult {
  filePath: string;
  duration: number;
}

export interface AudioLevel {
  level: number; // 0-100の正規化された音量レベル
}

type AudioLevelCallback = (data: AudioLevel) => void;

class AudioRecorderService {
  private audioContext: AudioContext | null = null;
  private recorder: AudioRecorder | null = null;
  private isRecording = false;
  private isPaused = false;
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private outputPath: string | null = null;
  private audioLevelCallbacks: AudioLevelCallback[] = [];
  private audioBuffers: Float32Array[] = [];

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await AudioManager.requestRecordingPermissions();
      return permission === "Granted";
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permission = await AudioManager.checkRecordingPermissions();
      return permission === "Granted";
    } catch (error) {
      console.error("Permission check failed:", error);
      return false;
    }
  }

  async startRecording(outputFilePath: string): Promise<void> {
    if (this.isRecording) {
      console.warn("Already recording");
      return;
    }

    // パーミッション確認
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error("Recording permission not granted");
      }
    }

    // オーディオセッション設定
    AudioManager.setAudioSessionOptions({
      iosCategory: "playAndRecord",
      iosMode: "default",
      iosOptions: ["defaultToSpeaker", "allowBluetooth"],
    });

    // AudioContext作成
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });

    // レコーダー作成
    this.recorder = new AudioRecorder({
      sampleRate: SAMPLE_RATE,
      bufferLengthInSamples: BUFFER_LENGTH_IN_SAMPLES,
    });

    // RecorderAdapterを通じて接続
    const recorderAdapter = this.audioContext.createRecorderAdapter();
    this.recorder.connect(recorderAdapter);
    recorderAdapter.connect(this.audioContext.destination);

    // オーディオデータの収集
    this.audioBuffers = [];
    this.recorder.onAudioReady((event) => {
      if (this.isPaused) return;

      // バッファをコピーして保存
      const channelData = event.buffer.getChannelData(0);
      const bufferCopy = new Float32Array(channelData.length);
      bufferCopy.set(channelData);
      this.audioBuffers.push(bufferCopy);

      // 音量レベルを計算してコールバック
      const level = this.calculateAudioLevel(channelData);
      this.notifyAudioLevel(level);
    });

    // 録音開始
    this.recorder.start();
    this.isRecording = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.outputPath = outputFilePath;
  }

  private calculateAudioLevel(samples: Float32Array): number {
    // RMS（二乗平均平方根）で音量を計算
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);
    // 0-100に正規化（-60dB〜0dBの範囲を想定）
    const db = 20 * Math.log10(Math.max(rms, 0.000001));
    return Math.min(100, Math.max(0, ((db + 60) / 60) * 100));
  }

  private notifyAudioLevel(level: number): void {
    this.audioLevelCallbacks.forEach((callback) => {
      callback({ level });
    });
  }

  pauseRecording(): void {
    if (!this.isRecording || this.isPaused) return;
    this.isPaused = true;
    this.pauseStartTime = Date.now();
  }

  resumeRecording(): void {
    if (!this.isRecording || !this.isPaused) return;
    this.isPaused = false;
    this.pausedDuration += Date.now() - this.pauseStartTime;
  }

  async stopRecording(): Promise<RecordingResult | null> {
    if (!this.isRecording || !this.recorder) {
      return null;
    }

    // 録音停止
    this.recorder.stop();
    this.recorder.disconnect();

    const duration = Math.floor(
      (Date.now() - this.startTime - this.pausedDuration) / 1000
    );

    // WAVファイルを生成して保存
    if (this.outputPath && this.audioBuffers.length > 0) {
      await this.saveAsWav(this.outputPath);
    }

    // AudioContext終了
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    const result: RecordingResult = {
      filePath: this.outputPath!,
      duration,
    };

    // リセット
    this.isRecording = false;
    this.isPaused = false;
    this.recorder = null;
    this.outputPath = null;
    this.audioLevelCallbacks = [];
    this.audioBuffers = [];

    return result;
  }

  private async saveAsWav(filePath: string): Promise<void> {
    // 全バッファを結合
    const totalLength = this.audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const combinedBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const buffer of this.audioBuffers) {
      combinedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // WAVファイルを生成
    const wavData = this.encodeWav(combinedBuffer, SAMPLE_RATE);

    // Uint8Arrayに変換してファイルに書き込み
    const uint8Array = new Uint8Array(wavData);
    const file = new File(filePath);
    await file.write(uint8Array);
  }

  private encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const bufferSize = 44 + dataSize;

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // WAVヘッダー
    // RIFF chunk
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, bufferSize - 8, true);
    this.writeString(view, 8, "WAVE");

    // fmt chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCMデータを書き込み（Float32 → Int16変換）
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16Sample, true);
      offset += 2;
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  cancelRecording(): void {
    if (!this.isRecording) return;

    if (this.recorder) {
      this.recorder.stop();
      this.recorder.disconnect();
      this.recorder = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isRecording = false;
    this.isPaused = false;
    this.outputPath = null;
    this.audioLevelCallbacks = [];
    this.audioBuffers = [];
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
