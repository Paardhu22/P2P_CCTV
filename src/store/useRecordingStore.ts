import { create } from 'zustand';
import { storage } from './useAppStore';
import { RecordingMetadata } from '../services/recording/types';
import { Logger } from '../utils/logger';

const RECORDINGS_KEY = 'app.recordings';

interface RecordingStore {
  recordings: RecordingMetadata[];
  addRecording: (recording: RecordingMetadata) => void;
  removeRecording: (id: string) => void;
  loadRecordings: () => void;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  recordings: [],
  addRecording: (recording) => {
    const newRecordings = [recording, ...get().recordings];
    set({ recordings: newRecordings });
    storage.set(RECORDINGS_KEY, JSON.stringify(newRecordings));
  },
  removeRecording: (id) => {
    const newRecordings = get().recordings.filter(r => r.id !== id);
    set({ recordings: newRecordings });
    storage.set(RECORDINGS_KEY, JSON.stringify(newRecordings));
  },
  loadRecordings: () => {
    try {
      const data = storage.getString(RECORDINGS_KEY);
      if (data) {
        set({ recordings: JSON.parse(data) });
      }
    } catch (e) {
      Logger.error('Failed to load recordings', e);
    }
  }
}));

useRecordingStore.getState().loadRecordings();
