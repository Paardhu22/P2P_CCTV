import * as Crypto from 'expo-crypto';

export interface QRPayload {
  deviceId: string;
  token: string;
}

export class PairingService {
  /**
   * Generates a persistent unique device ID.
   */
  static generateDeviceId(): string {
    return Crypto.randomUUID();
  }

  /**
   * Generates a short, random alphanumeric pairing token.
   */
  static generateToken(): string {
    const bytes = Crypto.getRandomBytes(4);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }

  /**
   * Encodes the device ID and token into a JSON string payload for the QR code.
   */
  static encodeQRPayload(deviceId: string, token: string): string {
    const payload: QRPayload = { deviceId, token };
    return JSON.stringify(payload);
  }

  /**
   * Safely parses and validates a raw string from a scanned QR code.
   */
  static parseQRPayload(rawString: string): QRPayload | null {
    try {
      const parsed = JSON.parse(rawString);
      if (parsed && typeof parsed.deviceId === 'string' && typeof parsed.token === 'string') {
        return {
          deviceId: parsed.deviceId,
          token: parsed.token,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
