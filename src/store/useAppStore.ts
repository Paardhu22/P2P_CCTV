import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

type Role = 'none' | 'camera' | 'viewer';

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: (storage.getString('app.role') as Role) || 'none',
  setRole: (role) => {
    storage.set('app.role', role);
    set({ role });
  },
}));
