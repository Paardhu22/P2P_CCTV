import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Button } from '../../src/components';
import { typography, colors, spacing } from '../../src/theme';
import { usePairingStore } from '../../src/store/usePairingStore';
import { router, useLocalSearchParams } from 'expo-router';

export default function ViewerConfirmScreen() {
  const { deviceId, token } = useLocalSearchParams<{ deviceId: string, token: string }>();
  const { addDevice } = usePairingStore();

  const handlePair = () => {
    if (!deviceId || !token) return;
    
    addDevice({
      id: deviceId,
      name: `Camera ${deviceId.substring(0, 4)}`,
      token: token,
      pairedAt: Date.now(),
      lastSeen: Date.now(),
    });

    router.dismissAll();
    router.replace('/viewer');
  };

  return (
    <Screen style={styles.centerContainer}>
      <View style={styles.card}>
        <Text style={[typography.h1, styles.title]}>Device Found</Text>
        
        <View style={styles.infoBox}>
          <Text style={typography.bodySecondary}>Device ID:</Text>
          <Text style={typography.title}>{deviceId}</Text>
        </View>

        <Text style={[typography.h2, styles.prompt]}>Pair?</Text>

        <View style={styles.buttonRow}>
          <Button 
            title="Cancel" 
            onPress={() => router.back()} 
            style={styles.cancelBtn} 
          />
          <View style={{ width: spacing.m }} />
          <Button 
            title="Pair" 
            onPress={handlePair} 
            style={styles.pairBtn} 
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: spacing.l,
    width: '100%',
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.l,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: spacing.s,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  prompt: {
    marginBottom: spacing.l,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.border,
  },
  pairBtn: {
    flex: 1,
  },
});
