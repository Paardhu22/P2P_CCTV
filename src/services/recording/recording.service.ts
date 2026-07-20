import * as FileSystem from 'expo-file-system/legacy';
import { useRecordingStore } from '../../store/useRecordingStore';
import { Logger } from '../../utils/logger';
import { RecordingState, RecordingMetadata } from './types';

class RecordingService {
  private startTime = 0;

  public markStartTime() {
    this.startTime = Date.now();
  }

  public async handleRecordingSuccess(
    filePath: string, 
    onStateChange: (state: RecordingState) => void, 
    onError: (e: Error) => void
  ) {
    try {
      onStateChange('Saving');
      const durationMs = Date.now() - this.startTime;
      const durationSec = Math.floor(durationMs / 1000);

      const date = new Date();
      const folderName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const baseDir = `${FileSystem.documentDirectory}Recordings/${folderName}`;
      
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
      
      const id = Date.now().toString();
      const filename = `clip_${id}.mp4`;
      const newPath = `${baseDir}/${filename}`;
      
      let sourcePath = filePath;
      if (!sourcePath.startsWith('file://')) {
        sourcePath = `file://${sourcePath}`;
      }

      await FileSystem.moveAsync({
        from: sourcePath,
        to: newPath
      });

      const fileInfo = await FileSystem.getInfoAsync(newPath);
      const size = fileInfo.exists ? fileInfo.size : 0;

      const metadata: RecordingMetadata = {
        id,
        filename,
        createdAt: date.toISOString(),
        duration: durationSec,
        size,
        path: newPath
      };

      useRecordingStore.getState().addRecording(metadata);
      onStateChange('Saved');
      
      setTimeout(() => onStateChange('Idle'), 2000);
      
    } catch (e: any) {
      Logger.error("Failed to save recording:", e);
      onStateChange('Error');
      onError(e);
    }
  }
}

export const recordingService = new RecordingService();
