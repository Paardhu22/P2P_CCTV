import { MediaStream } from 'react-native-webrtc';

export type WebRTCPeerState = 'Disconnected' | 'Connecting' | 'Connected' | 'Failed' | 'Closed';

export interface PeerStateInfo {
  connectionState: WebRTCPeerState;
  signalingState: string;
  iceConnectionState: string;
  remoteStream: MediaStream | null;
}
