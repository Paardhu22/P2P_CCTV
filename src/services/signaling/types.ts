export type ConnectionState = 'Offline' | 'Connecting' | 'Connected';

export interface RegisterMessage {
  type: 'register';
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
}

export interface PingMessage {
  type: 'ping';
}

export interface PongMessage {
  type: 'pong';
}

export interface GetOnlineDevicesMessage {
  type: 'get_online_devices';
  deviceIds: string[];
}

export interface OnlineDevicesResponseMessage {
  type: 'online_devices_response';
  devices: {
    deviceId: string;
    metadata: {
      deviceName: string;
      platform: string;
      appVersion: string;
    };
  }[];
}

export interface WebrtcOfferMessage {
  type: 'offer';
  targetDeviceId: string;
  senderDeviceId?: string;
  sdp: string;
}

export interface WebrtcAnswerMessage {
  type: 'answer';
  targetDeviceId: string;
  senderDeviceId?: string;
  sdp: string;
}

export interface WebrtcIceCandidateMessage {
  type: 'ice_candidate';
  targetDeviceId: string;
  senderDeviceId?: string;
  candidate: any;
}

export type SignalingMessage = 
  | RegisterMessage 
  | PingMessage 
  | PongMessage 
  | GetOnlineDevicesMessage 
  | OnlineDevicesResponseMessage
  | WebrtcOfferMessage
  | WebrtcAnswerMessage
  | WebrtcIceCandidateMessage;
