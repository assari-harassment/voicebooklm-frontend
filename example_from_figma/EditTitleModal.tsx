import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import type { Note } from '../App';

type EditTitleModalProps = {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onTitleChange: (newTitle: string) => void;
};

export function EditTitleModal({ isOpen, note, onClose, onTitleChange }: EditTitleModalProps) {
  const [title, setTitle] = useState(note?.title || '');

  // モーダルが開くたびにタイトルをリセット
  useEffect(() => {
    if (isOpen && note) {
      setTitle(note.title);
    }
  }, [isOpen, note]);

  const handleSave = () => {
    if (title.trim()) {
      onTitleChange(title.trim());
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
            >
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                <Text className="text-lg text-gray-900 font-medium">タイトルを編集</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center rounded-lg bg-gray-100"
                >
                  <X size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <View className="px-6 py-6">
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="タイトルを入力"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base"
                  autoFocus
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                />
              </View>

              <View className="flex-row items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
                <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-lg bg-gray-200">
                  <Text className="text-gray-700 font-medium">キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!title.trim()}
                  className={`px-4 py-2 rounded-lg ${!title.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                  <Text className="text-white font-medium">保存</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
