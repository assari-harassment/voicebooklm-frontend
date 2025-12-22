import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  Button,
  Dialog,
  Divider,
  FAB,
  IconButton,
  Menu,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { colors } from '../src/constants/colors';
import type { Note, User } from '../src/types';

// サンプルデータ
const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'プロジェクト企画会議',
    date: new Date(2025, 0, 15, 14, 30),
    folder: 'Meetings',
    summary: '# プロジェクト企画会議\n新規プロジェクトの方向性について議論',
    tags: ['仕事', '会議'],
  },
  {
    id: '2',
    title: '読書メモ - AIの未来',
    date: new Date(2025, 0, 14, 20, 0),
    folder: 'Reading Notes',
    summary: '# 読書メモ - AIの未来\n人工知能の発展と社会への影響',
    tags: ['読書', 'AI'],
  },
  {
    id: '3',
    title: '新しいアイデア',
    date: new Date(2025, 0, 13, 9, 15),
    folder: 'Ideas',
    summary: '# 新しいアイデア\nアプリの新機能について',
    tags: ['アイデア'],
  },
];

const sampleUser: User = {
  name: '田中太郎',
  email: 'tanaka@example.com',
};

type FolderItem = {
  name: string;
  indent: number;
};

type CategoryItem = {
  category: string;
  color: string;
  folders: FolderItem[];
};

const folderStructure: CategoryItem[] = [
  {
    category: 'Work',
    color: colors.brand[500],
    folders: [
      { name: 'Projects', indent: 1 },
      { name: 'Meetings', indent: 1 },
      { name: 'Client Notes', indent: 1 },
    ],
  },
  {
    category: 'Personal',
    color: colors.accent[500],
    folders: [
      { name: 'Learning', indent: 1 },
      { name: 'Ideas', indent: 1 },
      { name: 'Reading Notes', indent: 1 },
    ],
  },
  {
    category: 'Archive',
    color: colors.text.secondary,
    folders: [{ name: 'Old Projects', indent: 1 }],
  },
];

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [user] = useState<User | null>(sampleUser);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Work: true,
    Personal: true,
    Archive: false,
  });
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const recentNotes = notes.slice(0, 3);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getFolderCount = (folderName: string) => {
    return notes.filter((note) => note.folder === folderName).length;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const handleNoteClick = (noteId: string) => {
    console.log('Note clicked:', noteId);
    // TODO: Navigate to note detail
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
    // TODO: Navigate to search
  };

  const handleFolderClick = (folderName: string) => {
    console.log('Folder clicked:', folderName);
    // TODO: Navigate to folder view
  };

  const handleAccountClick = () => {
    console.log('Account clicked');
    // TODO: Show account menu
  };

  const handleEditTitle = (note: Note) => {
    setEditingNote(note);
    setEditingTitle(note.title);
    setEditDialogVisible(true);
    setMenuVisible(null);
  };

  const handleSaveTitle = () => {
    if (editingNote && editingTitle.trim()) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, title: editingTitle.trim() } : n))
      );
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
        onPress: () => {
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-t-bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        stickyHeaderIndices={[0]}
      >
        {/* Header - Sticky */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-t-bg-primary">
          <TouchableRipple onPress={handleAccountClick} className="rounded-lg" borderless>
            <View className="flex-row items-center gap-2 px-3 py-2 bg-t-bg-secondary rounded-lg">
              <MaterialCommunityIcons
                name="account-circle"
                size={24}
                color={colors.text.secondary}
              />
              <Text variant="titleSmall" className="text-t-text-primary font-medium">
                {user?.name || 'Workspace'}
              </Text>
            </View>
          </TouchableRipple>
          <IconButton
            icon="magnify"
            size={24}
            onPress={handleSearchClick}
            className="bg-t-bg-primary border border-t-border-secondary"
            accessibilityLabel="検索"
          />
        </View>

        {/* 最近のメモ */}
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
                  onPress={() => handleNoteClick(note.id)}
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

        {/* フォルダ一覧 */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-1 h-5 rounded-sm bg-t-success-500" />
            <Text variant="titleMedium" className="font-bold text-t-text-primary">
              フォルダ
            </Text>
          </View>
          <View>
            {folderStructure.map((category) => (
              <View key={category.category}>
                <TouchableRipple
                  onPress={() => toggleCategory(category.category)}
                  className="px-3 py-3 rounded-lg"
                >
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name={
                        expandedCategories[category.category] ? 'chevron-down' : 'chevron-right'
                      }
                      size={18}
                      color={colors.text.secondary}
                    />
                    <MaterialCommunityIcons name="folder" size={20} color={colors.text.secondary} />
                    <Text variant="bodyMedium" className="text-t-text-primary font-medium">
                      {category.category}
                    </Text>
                  </View>
                </TouchableRipple>

                {expandedCategories[category.category] &&
                  category.folders.map((folder) => (
                    <TouchableRipple
                      key={folder.name}
                      onPress={() => handleFolderClick(folder.name)}
                      className="ml-6 px-3 py-3 rounded-lg"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1">
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={18}
                            color={colors.text.tertiary}
                          />
                          <Text
                            variant="bodyMedium"
                            className="text-t-text-secondary"
                            numberOfLines={1}
                          >
                            {folder.name}
                          </Text>
                        </View>
                        <Text variant="bodySmall" className="text-t-text-tertiary">
                          {getFolderCount(folder.name)}
                        </Text>
                      </View>
                    </TouchableRipple>
                  ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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

      {/* 録音ボタン (FAB) */}
      <FAB
        icon="microphone"
        color={colors.text.inverse}
        className="absolute bottom-6 self-center bg-t-brand-600 rounded-3xl"
        onPress={() => router.push('/record')}
        accessibilityLabel="録音を開始"
      />
    </View>
  );
}
