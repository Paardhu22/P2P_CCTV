import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Screen, Button } from '../src/components';
import { typography, colors, spacing } from '../src/theme';
import { useCameraSetup } from '../src/hooks/useCameraSetup';
import { Camera } from 'react-native-vision-camera';

export default function CameraScreen() {
  const { device, hasPermission, requestPermission, isInitializing } = useCameraSetup();

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

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
        />
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        <Text style={typography.title}>Status: Ready</Text>
        <Button title="Pair Device" onPress={() => {}} />
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
});
