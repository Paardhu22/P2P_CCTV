import { useState, useEffect } from 'react';
import { ConnectionState } from '../services/signaling/types';
import { signalingService } from '../services/signaling/signaling.service';

export function useSignaling() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('Offline');

  useEffect(() => {
    signalingService.connect();

    const unsubscribe = signalingService.subscribeToState((state) => {
      setConnectionState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { connectionState };
}
