import { useState, useCallback, useEffect, useRef } from 'react';
import { useVideoOutput } from 'react-native-vision-camera';
import { recordingService } from '../services/recording/recording.service';
import { RecordingState } from '../services/recording/types';
import { Logger } from '../utils/logger';

export function useRecording() {
  const [recordingState, setRecordingState] = useState<RecordingState>('Idle');
  const [recordingError, setRecordingError] = useState<Error | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoOutput = useVideoOutput({ enableAudio: false });
  const recorderRef = useRef<any>(null);

  useEffect(() => {
    if (recordingState === 'Recording') {
      setDurationSec(0);
      timerRef.current = setInterval(() => {
        setDurationSec(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const startRecording = useCallback(async () => {
    if (!videoOutput) return;
    setRecordingError(null);
    try {
      setRecordingState('Recording');
      recordingService.markStartTime();
      recorderRef.current = await videoOutput.createRecorder({ fileType: 'mp4' } as any);
      await recorderRef.current.startRecording(
        (filePath: string) => {
          recordingService.handleRecordingSuccess(
            filePath, 
            (state) => setRecordingState(state), 
            (error) => setRecordingError(error)
          );
        },
        (error: any) => {
          Logger.error("Recording error:", error);
          setRecordingState('Error');
          setRecordingError(new Error(error?.message || 'Recording failed'));
        }
      );
    } catch (e: any) {
      Logger.error("Failed to start recording:", e);
      setRecordingState('Error');
      setRecordingError(e);
    }
  }, [videoOutput]);

  const stopRecording = useCallback(async () => {
    try {
      if (recorderRef.current) {
        await recorderRef.current.stopRecording();
        recorderRef.current = null;
      }
    } catch (e: any) {
      Logger.error("Error stopping recording:", e);
      setRecordingError(e);
      setRecordingState('Error');
    }
  }, []);

  return {
    recordingState,
    recordingError,
    durationSec,
    videoOutput,
    startRecording,
    stopRecording
  };
}
