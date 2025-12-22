import { Search, ArrowLeft, ChevronRight, MoreVertical, X } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import type { Note } from '../App';
import { EditTitleModal } from './EditTitleModal';

type SearchScreenProps = {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
  onBack: () => void;
  initialFolder?: string;
  onDeleteNote?: (noteId: string) => void;
  onUpdateNote?: (noteId: string, updates: Partial<Note>) => void;
};

export function SearchScreen({
  notes,
  onNoteClick,
  onBack,
  initialFolder,
  onDeleteNote,
  onUpdateNote,
}: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const searchHistory = ['プロジェクト会議', 'デザイン思考', 'アプリアイデア'];
  const popularTags = ['#仕事', '#学習', '#アイデア', '#ミーティング', '#開発'];

  // フォルダーフィルタリングを適用
  const displayNotes = initialFolder
    ? notes.filter((note) => note.folder === initialFolder)
    : notes;

  const filteredNotes = searchQuery
    ? displayNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : displayNotes;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const handleMenuPress = (note: Note) => {
    Alert.alert('メニュー', note.title, [
      {
        text: '編集',
        onPress: () => {
          setEditingNote(note);
          setEditingNoteId(note.id);
          setIsEditModalOpen(true);
        },
      },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          if (onDeleteNote) {
            Alert.alert('削除の確認', 'このメモを削除しますか？', [
              { text: 'キャンセル', style: 'cancel' },
              { text: '削除', style: 'destructive', onPress: () => onDeleteNote(note.id) },
            ]);
          }
        },
      },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header with Back Button */}
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
            accessibilityLabel="戻る"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-900 text-lg font-bold">
              {initialFolder ? initialFolder : '検索'}
            </Text>
            {initialFolder && (
              <Text className="text-sm text-gray-500">{displayNotes.length}件のメモ</Text>
            )}
          </View>
        </View>

        {/* 検索バー */}
        <View className="mb-6">
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Search size={20} color="#9CA3AF" />
            </View>
            <TextInput
              placeholder="メモを検索..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-base"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="absolute right-3 w-6 h-6 items-center justify-center rounded-full bg-gray-200"
              >
                <X size={14} color="#4B5563" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* 検索結果 */}
        {(searchQuery || initialFolder) && (
          <View className="mb-6">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="w-1 h-5 bg-blue-500 rounded-full" />
              <Text className="text-gray-900 font-bold">
                {searchQuery
                  ? `検索結果 (${filteredNotes.length}件)`
                  : `すべてのメモ (${filteredNotes.length}件)`}
              </Text>
            </View>
            <View className="gap-2">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <View
                    key={note.id}
                    className="w-full p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <TouchableOpacity onPress={() => onNoteClick(note.id)} className="flex-1">
                        <Text className="mb-2 text-gray-900 font-medium text-base">
                          {note.title}
                        </Text>
                        <View className="flex-row flex-wrap mb-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <View
                              key={tag}
                              className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200 mr-1.5 mb-1.5"
                            >
                              <Text className="text-gray-700 text-xs leading-none">#{tag}</Text>
                            </View>
                          ))}
                        </View>
                        <View className="flex-row items-center gap-2">
                          <View className="w-1 h-1 rounded-full bg-gray-400" />
                          <Text className="text-sm text-gray-500">{formatDate(note.date)}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Menu Button */}
                      <TouchableOpacity
                        onPress={() => handleMenuPress(note)}
                        className="w-8 h-8 items-center justify-center rounded-lg"
                      >
                        <MoreVertical size={16} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-8 bg-white rounded-xl border border-gray-100 items-center">
                  <Text className="text-gray-400">該当するメモが見つかりませんでした</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 検索履歴 */}
        {!searchQuery && !initialFolder && (
          <>
            <View className="mb-6">
              <View className="mb-3 flex-row items-center gap-2">
                <View className="w-1 h-5 bg-orange-500 rounded-full" />
                <Text className="text-gray-900 font-bold">検索履歴</Text>
              </View>
              <View className="gap-2">
                {searchHistory.map((query) => (
                  <TouchableOpacity
                    key={query}
                    onPress={() => setSearchQuery(query)}
                    className="w-full flex-row items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <Text className="text-gray-700">{query}</Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* タグ候補 */}
            <View>
              <View className="mb-3 flex-row items-center gap-2">
                <View className="w-1 h-5 bg-purple-500 rounded-full" />
                <Text className="text-gray-900 font-bold">人気のタグ</Text>
              </View>
              <View className="flex-row flex-wrap">
                {popularTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setSearchQuery(tag)}
                    className="flex-row items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 mr-2 mb-2"
                  >
                    <View className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    <Text className="text-sm text-gray-700 leading-none">{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Title Modal */}
      <EditTitleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={editingNote}
        onTitleChange={(newTitle) => {
          if (onUpdateNote && editingNoteId && editingNote) {
            const lines = editingNote.summary.split('\n');
            if (lines[0].startsWith('#')) {
              lines[0] = `# ${newTitle}`;
              const updatedSummary = lines.join('\n');
              onUpdateNote(editingNoteId, { title: newTitle, summary: updatedSummary });
            } else {
              onUpdateNote(editingNoteId, { title: newTitle });
            }
          }
        }}
      />
    </View>
  );
}
