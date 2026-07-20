import { Logger } from '../../utils/logger';

type MessageHandler = (data: any) => void;
type StateHandler = (connected: boolean) => void;

export class RobustWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: MessageHandler;
  private onStateChange: StateHandler;
  
  private isIntentionalClose: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  private readonly baseBackoffMs: number = 1000;
  
  constructor(url: string, onMessage: MessageHandler, onStateChange: StateHandler) {
    this.url = url;
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;
  }

  connect() {
    this.isIntentionalClose = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onStateChange(true);
    };
    
    this.ws.onmessage = (event) => {
      this.onMessage(event.data);
    };
    
    this.ws.onclose = () => {
      this.onStateChange(false);
      this.ws = null;
      if (!this.isIntentionalClose) {
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      Logger.warn("WebSocket error");
    };
  }

  disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  forceReconnect() {
    this.isIntentionalClose = false;
    if (this.ws) {
      this.ws.close(); // triggers onclose which schedules reconnect
    } else {
      this.scheduleReconnect();
    }
  }

  send(data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      Logger.warn("Attempted to send message while WebSocket is not open");
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Logger.warn("Max reconnect attempts reached.");
      return;
    }
    
    const backoff = Math.min(
      this.baseBackoffMs * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
      30000 
    );
    
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, backoff);
  }
}
