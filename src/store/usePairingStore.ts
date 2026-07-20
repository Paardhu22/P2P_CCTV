import { create } from 'zustand';
import { storage } from './useAppStore';

export interface PairedDevice {
  id: string;
  name: string;
  pairedAt: number;
  lastSeen: number;
  token: string;
}

interface PairingState {
  devices: PairedDevice[];
  addDevice: (device: PairedDevice) => void;
  removeDevice: (id: string) => void;
}

const DEVICES_KEY = 'app.paired_devices';

function getStoredDevices(): PairedDevice[] {
  try {
    const data = storage.getString(DEVICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export const usePairingStore = create<PairingState>((set) => ({
  devices: getStoredDevices(),
  addDevice: (device) => {
    set((state) => {
      const exists = state.devices.some((d) => d.id === device.id);
      if (exists) return state;
      
      const newDevices = [...state.devices, device];
      storage.set(DEVICES_KEY, JSON.stringify(newDevices));
      return { devices: newDevices };
    });
  },
  removeDevice: (id) => {
    set((state) => {
      const newDevices = state.devices.filter((d) => d.id !== id);
      storage.set(DEVICES_KEY, JSON.stringify(newDevices));
      return { devices: newDevices };
    });
  },
}));
