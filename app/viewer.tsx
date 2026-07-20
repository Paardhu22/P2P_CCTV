import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../src/components';
import { typography } from '../src/theme';

export default function ViewerScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Viewer Screen</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
  },
});
