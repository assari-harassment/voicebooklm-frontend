const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || 'ws://localhost:8080';

export type WebSocketMessageType =
  | 'START'
  | 'STOP'
  | 'READY'
  | 'STARTED'
  | 'STOPPED'
  | 'transcription'
  | 'error';

export interface WebSocketTextMessage {
  type: WebSocketMessageType;
  text?: string;
  isFinal?: boolean;
  language?: string;
  message?: string;
}

export interface TranscriptionWebSocketCallbacks {
  onReady: () => void;
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError: (code: string, message: string) => void;
  onClose: () => void;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'ready' | 'error';

export class TranscriptionWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: TranscriptionWebSocketCallbacks | null = null;
  private _connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  private setConnectionState(state: ConnectionState): void {
    this._connectionState = state;
    if (__DEV__) {
      console.log('[WebSocket] Connection state:', state);
    }
  }

  connect(token: string, callbacks: TranscriptionWebSocketCallbacks): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (__DEV__) {
        console.warn('[WebSocket] Already connected');
      }
      return;
    }

    this.callbacks = callbacks;
    this.setConnectionState('connecting');

    const url = `${WS_BASE_URL}/ws/transcription?token=${encodeURIComponent(token)}`;

    if (__DEV__) {
      console.log('[WebSocket] Connecting to:', url.replace(token, '***'));
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      if (__DEV__) {
        console.log('[WebSocket] Connected');
      }
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: WebSocketMessageEvent) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = (event: Event) => {
      if (__DEV__) {
        console.error('[WebSocket] Error:', event);
      }
      this.setConnectionState('error');
    };

    this.ws.onclose = (event: WebSocketCloseEvent) => {
      if (__DEV__) {
        console.log('[WebSocket] Closed:', event.code, event.reason);
      }
      this.setConnectionState('disconnected');
      this.callbacks?.onClose();
    };
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketTextMessage = JSON.parse(data);

      if (__DEV__) {
        console.log('[WebSocket] Received message:', message.type, message.text?.slice(0, 50));
      }

      switch (message.type) {
        case 'READY':
          this.setConnectionState('ready');
          this.callbacks?.onReady();
          break;
        case 'STARTED':
          if (__DEV__) {
            console.log('[WebSocket] Transcription started, language:', message.language);
          }
          break;
        case 'STOPPED':
          if (__DEV__) {
            console.log('[WebSocket] Transcription stopped');
          }
          break;
        case 'transcription':
          if (message.text !== undefined) {
            if (message.isFinal) {
              this.callbacks?.onFinal(message.text);
            } else {
              this.callbacks?.onInterim(message.text);
            }
          }
          break;
        case 'error':
          this.callbacks?.onError('ERROR', message.message || 'Unknown error');
          break;
        default:
          if (__DEV__) {
            console.warn('[WebSocket] Unknown message type:', message.type);
          }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    }
  }

  start(language: string = 'ja-JP'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (__DEV__) {
        console.error('[WebSocket] Cannot start: not connected');
      }
      return;
    }

    const message: WebSocketTextMessage = { type: 'START', language };
    this.ws.send(JSON.stringify(message));
    if (__DEV__) {
      console.log('[WebSocket] Sent START message');
    }
  }

  private audioSendCount = 0;

  sendAudio(pcmData: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    // バイナリメッセージとして直接送信
    this.ws.send(pcmData);

    this.audioSendCount++;
    if (__DEV__ && this.audioSendCount % 50 === 1) {
      console.log(
        '[WebSocket] Sending audio chunk #',
        this.audioSendCount,
        'size:',
        pcmData.byteLength
      );
    }
  }

  stop(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WebSocketTextMessage = { type: 'STOP' };
    this.ws.send(JSON.stringify(message));
    if (__DEV__) {
      console.log('[WebSocket] Sent STOP message');
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }

      this.ws = null;
    }

    this.setConnectionState('disconnected');
    this.callbacks = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  isReady(): boolean {
    return this._connectionState === 'ready';
  }
}

// シングルトンインスタンス
export const transcriptionWebSocket = new TranscriptionWebSocket();
