import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Screen, Button } from '../src/components';
import { typography, colors, spacing } from '../src/theme';
import { useCameraSetup } from '../src/hooks/useCameraSetup';
import { Camera } from 'react-native-vision-camera';
import { router } from 'expo-router';
import { useSignaling } from '../src/hooks/useSignaling';
import { usePeerConnection } from '../src/hooks/usePeerConnection';
import { useVideoStream } from '../src/hooks/useVideoStream';
import { useRecording } from '../src/hooks/useRecording';

export default function CameraScreen() {
  const { device, hasPermission, requestPermission, isInitializing } = useCameraSetup();
  const { connectionState } = useSignaling();
  const { peerState } = usePeerConnection();
  const isViewerConnected = peerState.connectionState === 'Connected';
  const { streamingState, error } = useVideoStream(isViewerConnected);

  const { recordingState, durationSec, videoOutput, startRecording, stopRecording } = useRecording();

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusColor = () => {
    switch(connectionState) {
      case 'Connected': return 'green';
      case 'Connecting': return 'orange';
      default: return 'red';
    }
  };

  if (isInitializing) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={typography.body}>Initializing Camera...</Text>
      </Screen>
    );
  }

  if (!hasPermission) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={[typography.h2, styles.permissionTitle]}>Camera Access Required</Text>
        <Text style={[typography.bodySecondary, styles.permissionDescription]}>
          To use this device as a security node, we need access to the camera.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </Screen>
    );
  }

  if (device == null) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>No Camera Available</Text>
        <Text style={[typography.bodySecondary, styles.permissionDescription]}>
          This device does not have a back camera.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <Text style={typography.title}>Camera Node</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Text style={typography.title}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Error Banners */}
      {connectionState === 'Offline' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Signaling Server Offline. Reconnecting...</Text>
        </View>
      )}
      {(peerState.connectionState === 'Failed' || peerState.iceConnectionState === 'failed') && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Peer Connection Failed. Attempting recovery...</Text>
        </View>
      )}

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          outputs={[videoOutput]}
        />

        {recordingState === 'Recording' && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC {formatDuration(durationSec)}</Text>
          </View>
        )}
        {(recordingState === 'Saving' || recordingState === 'Saved') && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recText}>{recordingState}...</Text>
          </View>
        )}
        
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>Signaling: {connectionState}</Text>
          <Text style={styles.debugText}>Peer: {peerState.connectionState}</Text>
          <Text style={styles.debugText}>ICE: {peerState.iceConnectionState}</Text>
          <Text style={styles.debugText}>WebRTC Sig: {peerState.signalingState}</Text>
          <Text style={styles.debugText}>Video: {streamingState}</Text>
          
          {error && <Text style={styles.errorText}>Video Error: {error.message}</Text>}
          
          {peerState.connectionState === 'Disconnected' && (
            <Text style={styles.waitingText}>Waiting for Peer...</Text>
          )}
        </View>
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={typography.title}>{connectionState}</Text>
        </View>
        
        {recordingState === 'Idle' || recordingState === 'Saved' || recordingState === 'Error' ? (
          <Button title="Record" onPress={startRecording} />
        ) : recordingState === 'Recording' ? (
          <Button title="Stop REC" onPress={stopRecording} style={{ backgroundColor: 'red' }} />
        ) : (
          <Button title="..." disabled />
        )}

        <Button title="Pair Device" onPress={() => router.push('/camera/pairing')} />
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
  permissionTitle: {
    ...typography.h2,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  permissionDescription: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconButton: {
    padding: spacing.s,
  },
  errorBanner: {
    backgroundColor: colors.error,
    padding: spacing.s,
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#fff',
    ...typography.bodySecondary,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.text,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.s,
  },
  debugOverlay: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.m,
    borderRadius: spacing.s,
  },
  debugText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  waitingText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    marginTop: spacing.s,
  },
  errorText: {
    color: '#ff0000',
    fontWeight: 'bold',
    marginTop: spacing.s,
    fontSize: 12,
  },
  recordingIndicator: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.m,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: spacing.s,
  },
  recText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  }
});
