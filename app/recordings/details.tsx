import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Screen, Button } from '../../src/components';
import { typography, colors, spacing } from '../../src/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { useRecordingStore } from '../../src/store/useRecordingStore';
import { galleryService } from '../../src/services/gallery/gallery.service';
import { useVideoPlayer, VideoView } from 'expo-video';
import { RecordingMetadata } from '../../src/services/recording/types';

const formatSize = (bytes: number) => {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

export default function RecordingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const recordings = useRecordingStore(state => state.recordings);
  const [recording, setRecording] = useState<RecordingMetadata | null>(null);
  
  useEffect(() => {
    const found = recordings.find(r => r.id === id);
    if (found) {
      setRecording(found);
    }
  }, [id, recordings]);

  const player = useVideoPlayer(recording?.path || null, player => {
    player.loop = true;
  });

  if (!recording) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={typography.body}>Recording not found or deleted.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const handleShare = async () => {
    await galleryService.shareRecording(recording.path);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording permanently?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const success = await galleryService.deleteRecording(recording.id, recording.path);
            if (success) {
              router.back();
            } else {
              Alert.alert("Error", "Failed to delete recording.");
            }
          }
        }
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h2} numberOfLines={1}>{recording.filename}</Text>
      </View>
      
      <View style={styles.videoContainer}>
        <VideoView 
          style={styles.video} 
          player={player} 
          allowsPictureInPicture 
          nativeControls={true}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Created: {formatTime(recording.createdAt)}</Text>
        <Text style={styles.detailText}>Duration: {recording.duration} seconds</Text>
        <Text style={styles.detailText}>File Size: {formatSize(recording.size)}</Text>
      </View>

      <View style={styles.actionRow}>
        <Button title="Share" onPress={handleShare} style={styles.actionButton} />
        <Button title="Delete" onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  header: {
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: spacing.l,
  },
  detailText: {
    ...typography.bodySecondary,
    marginBottom: spacing.s,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.l,
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error,
  }
});
