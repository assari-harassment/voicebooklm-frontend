import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Save, X } from 'lucide-react-native';

type TranscriptEditScreenProps = {
  title: string;
  transcript: string;
  onSave: (newTitle: string, newTranscript: string) => void;
  onCancel: () => void;
};

export function TranscriptEditScreen({
  title,
  transcript,
  onSave,
  onCancel,
}: TranscriptEditScreenProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleSave = () => {
    onSave(editedTitle, editedTranscript);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* ヘッダー */}
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-sm">
        <Text className="text-gray-900 font-bold text-lg">文字起こしを編集</Text>
        <TouchableOpacity
          onPress={onCancel}
          className="w-9 h-9 items-center justify-center rounded-xl bg-gray-50"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* タイトルエリア */}
      <View className="p-4 bg-white border-b border-gray-100">
        <TextInput
          value={editedTitle}
          onChangeText={setEditedTitle}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-base"
          placeholder="タイトルを編集..."
        />
      </View>

      {/* テキストエリア */}
      <View className="flex-1 p-4">
        <TextInput
          value={editedTranscript}
          onChangeText={setEditedTranscript}
          className="flex-1 p-4 bg-white border border-gray-200 rounded-xl text-base leading-relaxed"
          placeholder="文字起こしテキストを編集..."
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* フッター */}
      <View className="p-4 bg-white border-t border-gray-100 flex-row gap-2.5 shadow-sm">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 px-5 py-3 border border-gray-300 rounded-xl items-center justify-center"
        >
          <Text className="text-gray-700 font-medium">キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 px-5 py-3 bg-blue-600 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
        >
          <Save size={16} color="white" />
          <Text className="text-white font-bold">要約を再生成する</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
