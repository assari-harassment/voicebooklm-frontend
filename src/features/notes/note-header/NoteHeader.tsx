import { colors } from '@/src/shared/constants';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Dialog, Divider, IconButton, Menu, Portal, TextInput } from 'react-native-paper';

// 型定義
interface NoteHeaderProps {
  title: string;
  hasTranscription: boolean;
  showTranscription: boolean;
  onBackPress: () => void;
  onTitleChange: (newTitle: string) => void;
  onToggleTranscription: () => void;
  onDeleteNote: () => void;
}

// コンポーネント
export function NoteHeader({
  title,
  hasTranscription,
  showTranscription,
  onBackPress,
  onTitleChange,
  onToggleTranscription,
  onDeleteNote,
}: NoteHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);

  const handleEditTitle = () => {
    setEditingTitle(title);
    setEditDialogVisible(true);
    setMenuVisible(false);
  };

  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      onTitleChange(editingTitle.trim());
    }
    setEditDialogVisible(false);
  };

  const handleDeleteNote = () => {
    setMenuVisible(false);
    Alert.alert('削除の確認', 'このメモを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: onDeleteNote,
      },
    ]);
  };

  return (
    <>
      <View className="flex-row justify-between items-center mb-4">
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={onBackPress}
          className="bg-t-bg-primary border border-t-border-secondary"
          accessibilityLabel="ホームに戻る"
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setMenuVisible(true)}
              className="bg-t-bg-primary border border-t-border-secondary"
              accessibilityLabel="メニュー"
            />
          }
        >
          <Menu.Item onPress={handleEditTitle} title="タイトルを編集" leadingIcon="pencil" />
          {hasTranscription && (
            <Menu.Item
              onPress={() => {
                onToggleTranscription();
                setMenuVisible(false);
              }}
              title={showTranscription ? '要約を表示' : '文字起こしを表示'}
              leadingIcon={showTranscription ? 'text-box' : 'microphone'}
            />
          )}
          <Divider />
          <Menu.Item
            onPress={handleDeleteNote}
            title="削除"
            leadingIcon="delete"
            titleStyle={{ color: colors.danger[500] }}
          />
        </Menu>
      </View>

      {/* タイトル編集ダイアログ */}
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
