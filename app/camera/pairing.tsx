import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Button } from '../../src/components';
import { typography, colors, spacing } from '../../src/theme';
import { usePairingToken } from '../../src/hooks/usePairingToken';
import QRCode from 'react-native-qrcode-svg';
import { router } from 'expo-router';

export default function CameraPairingScreen() {
  const { qrPayload, timeLeftFormatted, generateNewToken } = usePairingToken();

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => router.back()} style={styles.backButton} />
        <Text style={typography.h2}>Pair Device</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={[typography.body, styles.instructions]}>
          Scan this QR code from your Viewer device to securely connect to this Camera Node.
        </Text>

        <View style={styles.qrContainer}>
          {qrPayload ? (
            <QRCode
              value={qrPayload}
              size={250}
              color={colors.text}
              backgroundColor={colors.background}
            />
          ) : (
            <Text style={typography.bodySecondary}>Generating...</Text>
          )}
        </View>

        <Text style={[typography.h1, styles.timer]}>{timeLeftFormatted}</Text>
        <Text style={typography.bodySecondary}>until token expires</Text>

        <Button 
          title="Regenerate QR" 
          onPress={generateNewToken} 
          style={styles.regenerateBtn} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  qrContainer: {
    padding: spacing.l,
    backgroundColor: colors.background,
    borderRadius: spacing.m,
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: spacing.xxl,
  },
  timer: {
    ...typography.h1,
    marginBottom: spacing.s,
  },
  regenerateBtn: {
    marginTop: spacing.xxl,
    width: '100%',
  },
});
