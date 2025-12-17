import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";
import {
  Plus,
  X,
  ChevronRight,
  ArrowLeft,
  FileText,
  MoreVertical,
} from "lucide-react-native";
import Markdown from "react-native-markdown-display";
import type { Note } from "../App";

type NoteDetailScreenProps = {
  note: Note;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onRegenerateSummary: (noteId: string) => void;
  onEditTranscript: (noteId: string, transcript: string) => void;
  onDeleteNote: (noteId: string) => void;
  onBack: () => void;
};

export function NoteDetailScreen({
  note,
  onUpdateNote,
  onRegenerateSummary,
  onEditTranscript,
  onDeleteNote,
  onBack,
}: NoteDetailScreenProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim()) {
      const updatedTags = [...note.tags, newTag.trim()];
      onUpdateNote(note.id, { tags: updatedTags });
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = note.tags.filter((tag) => tag !== tagToRemove);
    onUpdateNote(note.id, { tags: updatedTags });
  };

  const handleEditTranscriptClick = () => {
    // モックの文字起こしテキスト
    const mockTranscript = `これは元の文字起こしテキストです。実際の実装では、録音時の文字起こしをキャッシュから取得します。

音声入力から生成された詳細な文字起こしがここに表示されます。ユーザーはこのテキストを編集して、より正確な要約を生成することができます。

例えば、固有名詞の修正や、不要な部分の削除などを行うことができます。`;

    onEditTranscript(note.id, mockTranscript);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const handleMenuPress = () => {
    Alert.alert("メニュー", undefined, [
      { text: "編集", onPress: handleEditTranscriptClick },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          Alert.alert("削除の確認", "このメモを削除しますか？", [
            { text: "キャンセル", style: "cancel" },
            {
              text: "削除",
              style: "destructive",
              onPress: () => onDeleteNote(note.id),
            },
          ]);
        },
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header with Back Button and Menu */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
            accessibilityLabel="戻る"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          {/* Menu Button */}
          <TouchableOpacity
            onPress={handleMenuPress}
            className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
            accessibilityLabel="メニュー"
          >
            <MoreVertical size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* タイトル */}
        <Text className="mb-4 text-2xl font-bold text-gray-900">
          {note.title}
        </Text>

        {/* メタ情報 */}
        <View className="mb-4 flex-row items-center gap-3">
          <View className="flex-row items-center gap-2">
            <View className="w-1 h-1 rounded-full bg-gray-400" />
            <Text className="text-sm text-gray-500">
              {formatDate(note.date)}
            </Text>
          </View>
          {note.folder && (
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-1 rounded-full bg-gray-300" />
              <Text className="text-sm text-gray-500">{note.folder}</Text>
            </View>
          )}
        </View>

        {/* タグ一覧 */}
        <View className="mb-6">
          <View className="flex-row flex-wrap">
            {note.tags.map((tag) => (
              <View
                key={tag}
                className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 mr-2 mb-2"
              >
                <Text className="text-sm text-gray-700 leading-none">
                  #{tag}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  className="rounded-full bg-gray-200 p-0.5 ml-1.5"
                >
                  <X size={10} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}

            {isAddingTag ? (
              <View className="flex-row items-center mr-2 mb-2">
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={handleAddTag}
                  onBlur={handleAddTag}
                  placeholder="タグ名"
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white min-w-[100px]"
                  autoFocus
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsAddingTag(true)}
                className="flex-row items-center justify-center px-3 bg-white rounded-lg border border-gray-200 border-dashed mr-2 mb-2"
                style={{ height: 36 }}
              >
                <Plus size={14} color="#4B5563" />
                <Text className="text-sm text-gray-600 ml-1.5 leading-none">
                  タグを追加
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 本文（Note） */}
        <View className="mb-4 bg-white rounded-xl">
          <Markdown
            style={{
              body: { color: "#374151", fontSize: 16, lineHeight: 24 },
              heading1: {
                fontSize: 24,
                fontWeight: "bold",
                marginVertical: 10,
                color: "#111827",
              },
              heading2: {
                fontSize: 20,
                fontWeight: "bold",
                marginVertical: 8,
                color: "#1F2937",
              },
              heading3: {
                fontSize: 18,
                fontWeight: "bold",
                marginVertical: 6,
                color: "#374151",
              },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: "#3B82F6",
                paddingLeft: 10,
                fontStyle: "italic",
                color: "#4B5563",
                marginVertical: 8,
              },
              code_inline: {
                backgroundColor: "#F3F4F6",
                borderRadius: 4,
                paddingHorizontal: 4,
                paddingVertical: 2,
                fontFamily: "System",
              },
              code_block: {
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
                fontFamily: "System",
              },
              list_item: { marginVertical: 4 },
              bullet_list: { marginVertical: 8 },
            }}
          >
            {note.summary}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
}
