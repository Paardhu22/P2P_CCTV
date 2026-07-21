import { useState, useMemo } from 'react';
import { useRecordingStore } from '../store/useRecordingStore';
import { RecordingMetadata } from '../services/recording/types';

export interface GallerySection {
  title: string;
  data: RecordingMetadata[];
}

export function useGallery() {
  const recordings = useRecordingStore(state => state.recordings);
  const [searchQuery, setSearchQuery] = useState('');

  const groupedRecordings = useMemo(() => {
    let filtered = recordings;

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = recordings.filter(r => 
        r.filename.toLowerCase().includes(query) ||
        new Date(r.createdAt).toLocaleDateString().toLowerCase().includes(query)
      );
    }

    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sections: Record<string, RecordingMetadata[]> = {};

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    filtered.forEach(recording => {
      const recDate = new Date(recording.createdAt);
      const recStr = recDate.toDateString();

      let sectionTitle = '';
      if (recStr === todayStr) {
        sectionTitle = 'Today';
      } else if (recStr === yesterdayStr) {
        sectionTitle = 'Yesterday';
      } else {
        sectionTitle = recDate.toLocaleDateString(undefined, { 
          month: 'long', 
          day: 'numeric',
          year: recDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      if (!sections[sectionTitle]) {
        sections[sectionTitle] = [];
      }
      sections[sectionTitle].push(recording);
    });

    return Object.keys(sections).map(key => ({
      title: key,
      data: sections[key]
    }));
  }, [recordings, searchQuery]);

  return {
    groupedRecordings,
    searchQuery,
    setSearchQuery,
    isEmpty: recordings.length === 0,
    isSearchEmpty: recordings.length > 0 && groupedRecordings.length === 0
  };
}
