import React from 'react';
import { StyleSheet, Text, View, TextInput, SectionList, TouchableOpacity } from 'react-native';
import { Screen } from '../../src/components';
import { typography, colors, spacing } from '../../src/theme';
import { useGallery } from '../../src/hooks/useGallery';
import { RecordingMetadata } from '../../src/services/recording/types';
import { router } from 'expo-router';

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatSize = (bytes: number) => {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RecordingCard = React.memo(({ item }: { item: RecordingMetadata }) => (
  <TouchableOpacity 
    style={styles.card} 
    activeOpacity={0.7}
    onPress={() => router.push({ pathname: '/recordings/details', params: { id: item.id } } as any)}
  >
    <View style={styles.thumbnailPlaceholder}>
      <Text style={styles.thumbnailDuration}>{formatDuration(item.duration)}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.filename}</Text>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardMeta}>{formatTime(item.createdAt)}</Text>
        <Text style={styles.cardMeta}>{formatSize(item.size)}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

export default function RecordingsGalleryScreen() {
  const { groupedRecordings, searchQuery, setSearchQuery, isEmpty, isSearchEmpty } = useGallery();

  if (isEmpty) {
    return (
      <Screen style={styles.emptyContainer}>
        <Text style={typography.h2}>Gallery</Text>
        <Text style={[typography.bodySecondary, styles.emptyText]}>
          No recordings yet.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h2}>Recordings</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by date or name..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isSearchEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={typography.bodySecondary}>No recordings match your search.</Text>
        </View>
      ) : (
        <SectionList
          sections={groupedRecordings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordingCard item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  emptyText: {
    marginTop: spacing.m,
  },
  header: {
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    marginTop: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.background,
    borderRadius: spacing.s,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    ...typography.bodySecondary,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 70,
    backgroundColor: colors.border,
    borderRadius: spacing.s,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: spacing.xs,
  },
  thumbnailDuration: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.m,
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {
    ...typography.bodySecondary,
    fontSize: 12,
  }
});
