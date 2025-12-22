import { colors } from '@/src/shared/constants';
import type { Note } from '@/src/shared/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';

// ユーティリティ
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}/${day} ${hours}:${minutes}`;
}

// 型定義
interface RecentNotesProps {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
  onEditNote: (noteId: string, newTitle: string) => void;
  onDeleteNote: (noteId: string) => void;
}

// コンポーネント
export function RecentNotes({ notes, onNoteClick, onEditNote, onDeleteNote }: RecentNotesProps) {
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const recentNotes = notes.slice(0, 3);

  const handleEditTitle = (note: Note) => {
    setEditingNote(note);
    setEditingTitle(note.title);
    setEditDialogVisible(true);
    setMenuVisible(null);
  };

  const handleSaveTitle = () => {
    if (editingNote && editingTitle.trim()) {
      onEditNote(editingNote.id, editingTitle.trim());
    }
    setEditDialogVisible(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    setMenuVisible(null);
    Alert.alert('削除の確認', 'このメモを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => onDeleteNote(noteId),
      },
    ]);
  };

  return (
    <>
      <View className="px-4 mb-6">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
          <Text variant="titleMedium" className="font-bold text-t-text-primary">
            最近のメモ
          </Text>
        </View>
        <View className="gap-2">
          {recentNotes.map((note) => (
            <Surface
              key={note.id}
              className="rounded-xl bg-t-bg-primary flex-row items-center"
              elevation={1}
            >
              <TouchableRipple
                onPress={() => onNoteClick(note.id)}
                className="flex-1 p-3 rounded-xl"
                borderless
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      variant="titleSmall"
                      className="text-t-text-primary font-medium mb-1"
                      numberOfLines={1}
                    >
                      {note.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="w-1 h-1 rounded-full bg-t-text-tertiary" />
                      <Text variant="bodySmall" className="text-t-text-secondary">
                        {formatDate(note.date)}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </View>
              </TouchableRipple>
              <Menu
                visible={menuVisible === note.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={18}
                    onPress={() => setMenuVisible(note.id)}
                    className="m-0"
                  />
                }
              >
                <Menu.Item
                  onPress={() => handleEditTitle(note)}
                  title="編集"
                  leadingIcon="pencil"
                />
                <Divider />
                <Menu.Item
                  onPress={() => handleDeleteNote(note.id)}
                  title="削除"
                  leadingIcon="delete"
                  titleStyle={{ color: colors.danger[500] }}
                />
              </Menu>
            </Surface>
          ))}
        </View>
      </View>

      {/* Edit Title Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>タイトルを編集</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={editingTitle}
              onChangeText={setEditingTitle}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>キャンセル</Button>
            <Button onPress={handleSaveTitle}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
