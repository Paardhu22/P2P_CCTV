import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Card } from '../src/components';
import { typography, spacing } from '../src/theme';
import { useAppStore } from '../src/store/useAppStore';

export default function RoleSelectionScreen() {
  const setRole = useAppStore((state) => state.setRole);

  const handleSelectCamera = () => {
    setRole('camera');
    router.push('/camera');
  };

  const handleSelectViewer = () => {
    setRole('viewer');
    router.push('/viewer');
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Choose Device Role</Text>
      
      <View style={styles.cardsContainer}>
        <Card
          title="Camera"
          description="Use this device as a security camera."
          onPress={handleSelectCamera}
        />
        
        <Card
          title="Viewer"
          description="Use this device to monitor another device."
          onPress={handleSelectViewer}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: spacing.m,
  },
});
