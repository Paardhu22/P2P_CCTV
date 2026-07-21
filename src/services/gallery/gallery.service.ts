import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useRecordingStore } from '../../store/useRecordingStore';
import { Logger } from '../../utils/logger';

class GalleryService {
  public async deleteRecording(id: string, path: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }

      useRecordingStore.getState().removeRecording(id);
      return true;
    } catch (e) {
      Logger.error('Failed to delete recording', e);
      return false;
    }
  }

  public async shareRecording(path: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Logger.error('Sharing is not available on this device');
        return false;
      }
      
      await Sharing.shareAsync(path, {
        mimeType: 'video/mp4',
        dialogTitle: 'Share Recording'
      });
      return true;
    } catch (e) {
      Logger.error('Failed to share recording', e);
      return false;
    }
  }
}

export const galleryService = new GalleryService();
