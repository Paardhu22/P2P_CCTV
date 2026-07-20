import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Button } from '../../src/components';
import { typography, colors, spacing } from '../../src/theme';
import { useCameraSetup } from '../../src/hooks/useCameraSetup';
import { Camera, useObjectOutput } from 'react-native-vision-camera';
import { router } from 'expo-router';
import { PairingService } from '../../src/services/pairing/pairing.service';

export default function ViewerScanScreen() {
  const { device, hasPermission, requestPermission, isInitializing } = useCameraSetup();
  const [isScanned, setIsScanned] = useState(false);

  const objectOutput = useObjectOutput({
    types: ['qr'],
    onObjectsScanned: (objects) => {
      if (isScanned) return;
      
      for (const obj of objects) {
        const value = (obj as any).value;
        if (obj.type === 'qr' && typeof value === 'string') {
          const payload = PairingService.parseQRPayload(value);
          if (payload) {
            setIsScanned(true);
            router.push({
              pathname: '/viewer/confirm',
              params: { deviceId: payload.deviceId, token: payload.token }
            });
            return;
          }
        }
      }
    }
  });

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
        <Text style={[typography.h2, styles.title]}>Camera Access Required</Text>
        <Text style={[typography.bodySecondary, styles.description]}>
          To scan pairing QR codes, we need access to the camera.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </Screen>
    );
  }

  if (device == null) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.title}>No Camera Available</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => router.back()} style={styles.backButton} />
        <Text style={typography.h2}>Scan QR</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!isScanned}
          outputs={[objectOutput]}
        />
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
        </View>
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
  title: {
    ...typography.h2,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.text,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: 'transparent',
    borderRadius: spacing.m,
  }
});
