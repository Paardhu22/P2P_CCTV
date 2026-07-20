import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components';
import { typography, colors } from '../src/theme';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/role-selection');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen style={styles.container}>
      {/* App logo placeholder */}
      <View style={styles.logoPlaceholder} />
      <Text style={styles.title}>Private P2P CCTV</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.border,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
  },
});
