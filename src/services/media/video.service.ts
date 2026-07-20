import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { peerService } from '../webrtc/peer.service';
import { Logger } from '../../utils/logger';

class VideoService {
  private localStream: MediaStream | null = null;
  private initializingPromise: Promise<MediaStream> | null = null;

  public async startLocalStream(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }
    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    this.initializingPromise = (async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: false, 
          video: {
            facingMode: 'environment', 
          }
        });
        
        this.localStream = stream as MediaStream;
        peerService.setLocalStream(this.localStream);
        
        return this.localStream;
      } catch (error) {
        Logger.error('Error accessing media devices:', error);
        throw error;
      } finally {
        this.initializingPromise = null;
      }
    })();

    return this.initializingPromise;
  }

  public stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      // some versions of react-native-webrtc support release
      if (typeof (this.localStream as any).release === 'function') {
        (this.localStream as any).release();
      }
      this.localStream = null;
      peerService.setLocalStream(null);
    }
  }
}

export const videoService = new VideoService();
