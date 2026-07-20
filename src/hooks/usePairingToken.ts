import { useState, useEffect, useCallback } from 'react';
import { PairingService } from '../services/pairing/pairing.service';
import { storage } from '../store/useAppStore';

const DEVICE_ID_KEY = 'app.device_id';
const TOKEN_LIFETIME_MS = 5 * 60 * 1000; // 5 minutes

export function usePairingToken() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [qrPayload, setQrPayload] = useState<string>('');

  const initializeDeviceId = useCallback(() => {
    let id = storage.getString(DEVICE_ID_KEY);
    if (!id) {
      id = PairingService.generateDeviceId();
      storage.set(DEVICE_ID_KEY, id);
    }
    setDeviceId(id);
    return id;
  }, []);

  const generateNewToken = useCallback(() => {
    const id = deviceId || initializeDeviceId();
    const newToken = PairingService.generateToken();
    setToken(newToken);
    setQrPayload(PairingService.encodeQRPayload(id, newToken));
    setTimeLeft(TOKEN_LIFETIME_MS / 1000);
  }, [deviceId, initializeDeviceId]);

  useEffect(() => {
    generateNewToken();
  }, [generateNewToken]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (token) {
        generateNewToken();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, token, generateNewToken]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return {
    deviceId,
    token,
    qrPayload,
    timeLeftFormatted: formatTime(timeLeft),
    generateNewToken,
  };
}
