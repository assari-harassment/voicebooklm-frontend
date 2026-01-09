import type { Note } from '@/src/shared/types';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useProcessingStore } from '@/src/shared/stores/processingStore';

import { FolderList } from './folder-list';
import { RecentNotes } from './recent-notes';
import { RecordFab } from './record-fab';
import { folderStructure, sampleNotes } from './sample-data';

// コンポーネント
export function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);

  // トースト表示中はFABを無効化
  const isToastVisible = useProcessingStore((state) => state.status !== 'idle');

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const handleFolderClick = (_folderName: string) => {
    // TODO: Navigate to folder view
  };

  const handleEditNote = (noteId: string, newTitle: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleStartRecording = () => {
    router.push('/record');
  };

  return (
    <View className="flex-1 bg-t-bg-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
        {/* 最近のメモ */}
        <RecentNotes
          notes={notes}
          onNoteClick={handleNoteClick}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />

        {/* フォルダ一覧 */}
        <FolderList
          folderStructure={folderStructure}
          notes={notes}
          onFolderClick={handleFolderClick}
        />
      </ScrollView>

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} disabled={isToastVisible} />
    </View>
  );
}
