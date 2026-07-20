import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Screen, Button } from '../src/components';
import { typography, colors, spacing } from '../src/theme';
import { usePairingStore } from '../src/store/usePairingStore';
import { router } from 'expo-router';
import { useSignaling } from '../src/hooks/useSignaling';

export default function ViewerScreen() {
  const { devices, removeDevice } = usePairingStore();
  const { connectionState } = useSignaling();

  const getStatusColor = () => {
    switch(connectionState) {
      case 'Connected': return 'green';
      case 'Connecting': return 'orange';
      default: return 'red';
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={typography.h2}>No Devices Paired</Text>
      <Text style={[typography.bodySecondary, styles.emptyText]}>
        Pair a camera node to start monitoring.
      </Text>
    </View>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={typography.title}>Viewer Dashboard</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={typography.bodySecondary}>{connectionState}</Text>
          </View>
        </View>
        <Button 
          title="Scan QR to Pair" 
          onPress={() => router.push('/viewer/scan')} 
        />
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={typography.h2}>{item.name}</Text>
              <Text style={typography.bodySecondary}>ID: {item.id}</Text>
              <Text style={typography.bodySecondary}>
                Paired: {new Date(item.pairedAt).toLocaleDateString()}
              </Text>
            </View>
            <Button 
              title="Remove" 
              onPress={() => removeDevice(item.id)} 
              style={styles.removeBtn} 
            />
          </View>
        )}
      />
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
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.s,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: colors.background,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeBtn: {
    backgroundColor: colors.error,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.s,
  },
});
