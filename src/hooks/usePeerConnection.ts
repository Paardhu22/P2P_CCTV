import { useState, useEffect, useCallback } from 'react';
import { peerService } from '../services/webrtc/peer.service';
import { PeerStateInfo } from '../services/webrtc/types';

export function usePeerConnection() {
  const [peerState, setPeerState] = useState<PeerStateInfo>({
    connectionState: 'Disconnected',
    signalingState: 'closed',
    iceConnectionState: 'closed',
    remoteStream: null
  });

  useEffect(() => {
    const unsubscribe = peerService.subscribeToState((state) => {
      setPeerState(state);
    });
    return () => { unsubscribe(); };
  }, []);

  const connectToPeer = useCallback((peerId: string) => {
    peerService.connectToPeer(peerId);
  }, []);

  const disconnectPeer = useCallback(() => {
    peerService.close();
  }, []);

  return { peerState, connectToPeer, disconnectPeer };
}
