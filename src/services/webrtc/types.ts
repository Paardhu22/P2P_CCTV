export type WebRTCPeerState = 'Disconnected' | 'Connecting' | 'Connected' | 'Failed' | 'Closed';

export interface PeerStateInfo {
  connectionState: WebRTCPeerState;
  signalingState: string;
  iceConnectionState: string;
}
