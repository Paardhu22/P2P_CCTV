import { useState, useEffect } from 'react';
import { peerService } from '../services/webrtc/peer.service';
import { PeerStateInfo } from '../services/webrtc/types';

export function usePeerConnection() {
  const [peerState, setPeerState] = useState<PeerStateInfo>({
    connectionState: 'Disconnected',
    signalingState: 'closed',
    iceConnectionState: 'closed'
  });

  useEffect(() => {
    const unsubscribe = peerService.subscribeToState((state) => {
      setPeerState(state);
    });
    return () => { unsubscribe(); };
  }, []);

  const connectToPeer = (peerId: string) => {
    peerService.connectToPeer(peerId);
  };

  const disconnectPeer = () => {
    peerService.close();
  };

  return { peerState, connectToPeer, disconnectPeer };
}
