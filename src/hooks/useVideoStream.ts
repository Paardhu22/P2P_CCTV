import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { videoService } from '../services/media/video.service';
import { MediaStream } from 'react-native-webrtc';

export type StreamingState = 'Idle' | 'Streaming' | 'Viewer Connected' | 'Viewer Disconnected';

export function useVideoStream(isViewerConnected: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>('Idle');
  const [error, setError] = useState<Error | null>(null);

  const startStream = useCallback(async () => {
    try {
      const mediaStream = await videoService.startLocalStream();
      setStream(mediaStream);
      setStreamingState(isViewerConnected ? 'Viewer Connected' : 'Streaming');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Camera unavailable or permission denied'));
      setStreamingState('Idle');
    }
  }, [isViewerConnected]);

  const stopStream = useCallback(() => {
    videoService.stopLocalStream();
    setStream(null);
    setStreamingState(isViewerConnected ? 'Viewer Connected' : 'Viewer Disconnected');
  }, [isViewerConnected]);

  useEffect(() => {
    if (isViewerConnected) {
      startStream();
    } else {
      stopStream();
      setStreamingState('Viewer Disconnected');
    }
    
    // Cleanup on unmount
    return () => {
      videoService.stopLocalStream();
    };
  }, [isViewerConnected, startStream, stopStream]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopStream();
      } else if (nextAppState === 'active' && isViewerConnected) {
        startStream();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isViewerConnected, startStream, stopStream]);

  return { stream, streamingState, error };
}
