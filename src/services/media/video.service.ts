import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { peerService } from '../webrtc/peer.service';

class VideoService {
  private localStream: MediaStream | null = null;

  public async startLocalStream(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

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
      console.error('Error accessing media devices:', error);
      throw error;
    }
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
