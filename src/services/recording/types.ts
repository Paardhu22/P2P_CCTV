export type RecordingState = 'Idle' | 'Recording' | 'Saving' | 'Saved' | 'Error';

export interface RecordingMetadata {
  id: string;
  filename: string;
  createdAt: string;
  duration: number; // in seconds
  size: number; // in bytes
  path: string;
  thumbnail?: string; 
}
