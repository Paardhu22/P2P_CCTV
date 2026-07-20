import { Platform } from 'react-native';
import { RobustWebSocket } from './websocket';
import { ConnectionState, SignalingMessage, RegisterMessage, PingMessage, GetOnlineDevicesMessage } from './types';
import { storage } from '../../store/useAppStore';

const SIGNALING_URL = 'ws://192.168.1.100:8000/ws'; 
const DEVICE_ID_KEY = 'app.device_id';

type StateListener = (state: ConnectionState) => void;
type MessageListener = (msg: any) => void;

class SignalingService {
  private ws: RobustWebSocket | null = null;
  private state: ConnectionState = 'Offline';
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();

  private get deviceId(): string {
    return storage.getString(DEVICE_ID_KEY) || 'unknown_device';
  }

  connect() {
    if (this.ws) return;
    
    this.updateState('Connecting');
    this.ws = new RobustWebSocket(
      SIGNALING_URL,
      this.handleMessage.bind(this),
      this.handleStateChange.bind(this)
    );
    this.ws.connect();
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
    this.updateState('Offline');
  }

  subscribeToState(listener: StateListener) {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  subscribeToMessages(listener: MessageListener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  requestOnlineDevices(deviceIds: string[]) {
    const msg: GetOnlineDevicesMessage = { type: 'get_online_devices', deviceIds };
    this.send(msg);
  }

  private handleStateChange(connected: boolean) {
    if (connected) {
      this.updateState('Connected');
      this.sendRegistration();
      this.startHeartbeat();
    } else {
      this.updateState('Offline');
      this.stopHeartbeat();
    }
  }

  private handleMessage(data: string) {
    try {
      const parsed = JSON.parse(data) as SignalingMessage;
      if (parsed.type !== 'pong') {
        this.messageListeners.forEach(l => l(parsed));
      }
    } catch (e) {
      console.warn("Failed to parse signaling message:", e);
    }
  }

  private send(msg: SignalingMessage) {
    if (this.ws && this.state === 'Connected') {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private sendRegistration() {
    const registerMsg: RegisterMessage = {
      type: 'register',
      deviceId: this.deviceId,
      deviceName: `${Platform.OS} Device`,
      platform: Platform.OS,
      appVersion: '1.0.0'
    };
    if (this.ws) {
      this.ws.send(JSON.stringify(registerMsg));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      const pingMsg: PingMessage = { type: 'ping' };
      this.send(pingMsg);
    }, 30000); 
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private updateState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach(l => l(newState));
    }
  }
}

export const signalingService = new SignalingService();
