import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
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
} from "react-native-paper";
import type { Note, User } from "../src/types";

// サンプルデータ
const sampleNotes: Note[] = [
  {
    id: "1",
    title: "プロジェクト企画会議",
    date: new Date(2025, 0, 15, 14, 30),
    folder: "Meetings",
    summary: "# プロジェクト企画会議\n新規プロジェクトの方向性について議論",
    tags: ["仕事", "会議"],
  },
  {
    id: "2",
    title: "読書メモ - AIの未来",
    date: new Date(2025, 0, 14, 20, 0),
    folder: "Reading Notes",
    summary: "# 読書メモ - AIの未来\n人工知能の発展と社会への影響",
    tags: ["読書", "AI"],
  },
  {
    id: "3",
    title: "新しいアイデア",
    date: new Date(2025, 0, 13, 9, 15),
    folder: "Ideas",
    summary: "# 新しいアイデア\nアプリの新機能について",
    tags: ["アイデア"],
  },
];

const sampleUser: User = {
  name: "田中太郎",
  email: "tanaka@example.com",
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
    category: "Work",
    color: "#3B82F6",
    folders: [
      { name: "Projects", indent: 1 },
      { name: "Meetings", indent: 1 },
      { name: "Client Notes", indent: 1 },
    ],
  },
  {
    category: "Personal",
    color: "#A855F7",
    folders: [
      { name: "Learning", indent: 1 },
      { name: "Ideas", indent: 1 },
      { name: "Reading Notes", indent: 1 },
    ],
  },
  {
    category: "Archive",
    color: "#6B7280",
    folders: [{ name: "Old Projects", indent: 1 }],
  },
];

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [user] = useState<User | null>(sampleUser);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    Work: true,
    Personal: true,
    Archive: false,
  });
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const handleNoteClick = (noteId: string) => {
    console.log("Note clicked:", noteId);
    // TODO: Navigate to note detail
  };

  const handleSearchClick = () => {
    console.log("Search clicked");
    // TODO: Navigate to search
  };

  const handleFolderClick = (folderName: string) => {
    console.log("Folder clicked:", folderName);
    // TODO: Navigate to folder view
  };

  const handleAccountClick = () => {
    console.log("Account clicked");
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
        prev.map((n) =>
          n.id === editingNote.id ? { ...n, title: editingTitle.trim() } : n
        )
      );
    }
    setEditDialogVisible(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    setMenuVisible(null);
    Alert.alert("削除の確認", "このメモを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        {/* Header - Sticky */}
        <View style={styles.header}>
          <TouchableRipple
            onPress={handleAccountClick}
            style={styles.accountButton}
            borderless
          >
            <View style={styles.accountContent}>
              <MaterialCommunityIcons
                name="account-circle"
                size={24}
                color="#6B7280"
              />
              <Text variant="titleSmall" style={styles.accountName}>
                {user?.name || "Workspace"}
              </Text>
            </View>
          </TouchableRipple>
          <IconButton
            icon="magnify"
            size={24}
            onPress={handleSearchClick}
            style={styles.searchButton}
            accessibilityLabel="検索"
          />
        </View>

        {/* 最近のメモ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: "#3B82F6" }]} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              最近のメモ
            </Text>
          </View>
          <View style={styles.notesList}>
            {recentNotes.map((note) => (
              <Surface key={note.id} style={styles.noteCard} elevation={1}>
                <TouchableRipple
                  onPress={() => handleNoteClick(note.id)}
                  style={styles.noteContent}
                  borderless
                >
                  <View style={styles.noteInner}>
                    <View style={styles.noteInfo}>
                      <Text
                        variant="titleSmall"
                        style={styles.noteTitle}
                        numberOfLines={1}
                      >
                        {note.title}
                      </Text>
                      <View style={styles.noteMeta}>
                        <View style={styles.dateDot} />
                        <Text variant="bodySmall" style={styles.noteDate}>
                          {formatDate(note.date)}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#9CA3AF"
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
                      style={styles.menuButton}
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
                    titleStyle={styles.deleteText}
                  />
                </Menu>
              </Surface>
            ))}
          </View>
        </View>

        {/* フォルダ一覧 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: "#22C55E" }]} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              フォルダ
            </Text>
          </View>
          <View style={styles.folderList}>
            {folderStructure.map((category) => (
              <View key={category.category}>
                <TouchableRipple
                  onPress={() => toggleCategory(category.category)}
                  style={styles.categoryItem}
                >
                  <View style={styles.categoryContent}>
                    <MaterialCommunityIcons
                      name={
                        expandedCategories[category.category]
                          ? "chevron-down"
                          : "chevron-right"
                      }
                      size={18}
                      color="#6B7280"
                    />
                    <MaterialCommunityIcons
                      name="folder"
                      size={20}
                      color="#6B7280"
                    />
                    <Text variant="bodyMedium" style={styles.categoryName}>
                      {category.category}
                    </Text>
                  </View>
                </TouchableRipple>

                {expandedCategories[category.category] &&
                  category.folders.map((folder) => (
                    <TouchableRipple
                      key={folder.name}
                      onPress={() => handleFolderClick(folder.name)}
                      style={styles.folderItem}
                    >
                      <View style={styles.folderContent}>
                        <View style={styles.folderInfo}>
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={18}
                            color="#9CA3AF"
                          />
                          <Text
                            variant="bodyMedium"
                            style={styles.folderName}
                            numberOfLines={1}
                          >
                            {folder.name}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.folderCount}>
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
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
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
            <Button onPress={() => setEditDialogVisible(false)}>
              キャンセル
            </Button>
            <Button onPress={handleSaveTitle}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 録音ボタン (FAB) */}
      <FAB
        icon="microphone"
        style={styles.fab}
        onPress={() => router.push("/record")}
        accessibilityLabel="録音を開始"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  accountButton: {
    borderRadius: 8,
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  accountName: {
    color: "#111827",
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#111827",
  },
  notesList: {
    gap: 8,
  },
  noteCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  noteContent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  noteInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    color: "#111827",
    fontWeight: "500",
    marginBottom: 4,
  },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9CA3AF",
  },
  noteDate: {
    color: "#6B7280",
  },
  menuButton: {
    margin: 0,
  },
  deleteText: {
    color: "#EF4444",
  },
  folderList: {
    gap: 0,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryName: {
    color: "#374151",
    fontWeight: "500",
  },
  folderItem: {
    marginLeft: 24,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  folderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  folderName: {
    color: "#4B5563",
  },
  folderCount: {
    color: "#9CA3AF",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    borderRadius: 28,
  },
});
