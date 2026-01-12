import type { VoiceMemoCreatedResponse } from '@/src/api/generated/apiSchema';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';

import { NoteContent } from './note-content';
import { NoteTags } from './note-tags';
import type { NoteData } from './sample-data';
import { sampleNote } from './sample-data';

// ユーティリティ
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}/${day} ${hours}:${minutes}`;
}

// コンポーネント
export function NoteDetailScreen() {
  const { id, memoData } = useLocalSearchParams<{
    id: string;
    memoData?: string;
  }>();

  // APIレスポンスをパースしてNoteDataに変換
  const initialNote = useMemo<NoteData>(() => {
    if (memoData) {
      try {
        const parsed: VoiceMemoCreatedResponse = JSON.parse(memoData);
        return {
          id: parsed.memoId,
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags || [],
          transcription: parsed.transcription,
          date: new Date(),
        };
      } catch (e) {
        if (__DEV__) console.error('Failed to parse memoData:', e);
        return { ...sampleNote, id: id || sampleNote.id };
      }
    }
    return { ...sampleNote, id: id || sampleNote.id };
  }, [memoData, id]);

  const [note, setNote] = useState<NoteData>(initialNote);

  const handleAddTag = (tag: string) => {
    setNote((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNote((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <View className="flex-1 bg-t-bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        {/* タイトル */}
        <Text variant="headlineMedium" className="font-bold text-t-text-primary mb-3">
          {note.title}
        </Text>

        {/* メタ情報 */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-1 h-1 rounded-full bg-t-text-tertiary" />
            <Text variant="bodySmall" className="text-t-text-secondary">
              {formatDate(note.date)}
            </Text>
          </View>
        </View>

        {/* タグ一覧 */}
        <NoteTags tags={note.tags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />

        {/* 本文 */}
        <NoteContent
          content={note.content}
          transcription={note.transcription}
          showTranscription={false}
        />
      </ScrollView>
    </View>
  );
}
