import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import {
  Chip,
  Divider,
  IconButton,
  Menu,
  Surface,
  Text,
  TextInput,
  Button,
  Portal,
  Dialog,
} from "react-native-paper";
import type { CreateMemoResponse } from "../../src/api/generated/apiSchema";

interface NoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  transcription?: string;
  date: Date;
}

// サンプルメモデータ（APIからデータがない場合のフォールバック）
const sampleNote: NoteData = {
  id: "sample-note-id",
  title: "新しいメモ",
  content: `# 新しいメモ

これは音声から生成されたメモです。

## 主なポイント

- AIによって自動的に文字起こしされました
- 内容が整理されています
- タグを追加して管理できます`,
  tags: ["新規", "AI生成"],
  date: new Date(),
};

export default function NoteDetailScreen() {
  const { id, memoData } = useLocalSearchParams<{
    id: string;
    memoData?: string;
  }>();

  // APIレスポンスをパースしてNoteDataに変換
  const initialNote = useMemo<NoteData>(() => {
    if (memoData) {
      try {
        const parsed: CreateMemoResponse = JSON.parse(memoData);
        return {
          id: parsed.memoId,
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags,
          transcription: parsed.transcription,
          date: new Date(),
        };
      } catch (e) {
        console.error("Failed to parse memoData:", e);
        return { ...sampleNote, id: id || sampleNote.id };
      }
    }
    return { ...sampleNote, id: id || sampleNote.id };
  }, [memoData, id]);

  const [note, setNote] = useState<NoteData>(initialNote);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState(note.title);
  const [showTranscription, setShowTranscription] = useState(false);

  const handleGoHome = () => {
    router.replace("/home");
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNote((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNote((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleEditTitle = () => {
    setEditingTitle(note.title);
    setEditDialogVisible(true);
    setMenuVisible(false);
  };

  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      setNote((prev) => ({
        ...prev,
        title: editingTitle.trim(),
      }));
    }
    setEditDialogVisible(false);
  };

  const handleDeleteNote = () => {
    setMenuVisible(false);
    Alert.alert("削除の確認", "このメモを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          // TODO: APIでメモを削除
          router.replace("/home");
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const markdownStyles = {
    body: { color: "#374151", fontSize: 16, lineHeight: 24 },
    heading1: {
      fontSize: 24,
      fontWeight: "bold" as const,
      marginVertical: 10,
      color: "#111827",
    },
    heading2: {
      fontSize: 20,
      fontWeight: "bold" as const,
      marginVertical: 8,
      color: "#1F2937",
    },
    heading3: {
      fontSize: 18,
      fontWeight: "bold" as const,
      marginVertical: 6,
      color: "#374151",
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: "#3B82F6",
      paddingLeft: 10,
      fontStyle: "italic" as const,
      color: "#4B5563",
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: "#F3F4F6",
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      fontFamily: "System" as const,
    },
    code_block: {
      backgroundColor: "#F3F4F6",
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontFamily: "System" as const,
    },
    list_item: { marginVertical: 4 },
    bullet_list: { marginVertical: 8 },
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={20}
            onPress={handleGoHome}
            style={styles.headerButton}
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
                style={styles.headerButton}
                accessibilityLabel="メニュー"
              />
            }
          >
            <Menu.Item
              onPress={handleEditTitle}
              title="タイトルを編集"
              leadingIcon="pencil"
            />
            {note.transcription && (
              <Menu.Item
                onPress={() => {
                  setShowTranscription(!showTranscription);
                  setMenuVisible(false);
                }}
                title={showTranscription ? "要約を表示" : "文字起こしを表示"}
                leadingIcon={showTranscription ? "text-box" : "microphone"}
              />
            )}
            <Divider />
            <Menu.Item
              onPress={handleDeleteNote}
              title="削除"
              leadingIcon="delete"
              titleStyle={styles.deleteText}
            />
          </Menu>
        </View>

        {/* タイトル */}
        <Text variant="headlineMedium" style={styles.title}>
          {note.title}
        </Text>

        {/* メタ情報 */}
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.metaDot} />
            <Text variant="bodySmall" style={styles.metaText}>
              {formatDate(note.date)}
            </Text>
          </View>
        </View>

        {/* タグ一覧 */}
        <View style={styles.tagsSection}>
          <View style={styles.tagsContainer}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                style={styles.tag}
                textStyle={styles.tagText}
              >
                #{tag}
              </Chip>
            ))}
            {isAddingTag ? (
              <View style={styles.tagInputContainer}>
                <RNTextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={handleAddTag}
                  onBlur={() => {
                    if (newTag.trim()) {
                      handleAddTag();
                    } else {
                      setIsAddingTag(false);
                    }
                  }}
                  placeholder="タグ名"
                  style={styles.tagInput}
                  autoFocus
                />
              </View>
            ) : (
              <Chip
                icon="plus"
                onPress={() => setIsAddingTag(true)}
                style={styles.addTagChip}
                textStyle={styles.addTagText}
              >
                タグを追加
              </Chip>
            )}
          </View>
        </View>

        {/* 表示切り替えインジケーター */}
        {note.transcription && (
          <View style={styles.viewToggle}>
            <Chip
              icon={showTranscription ? "microphone" : "text-box"}
              style={styles.viewToggleChip}
              textStyle={styles.viewToggleText}
            >
              {showTranscription ? "文字起こし" : "AI要約"}
            </Chip>
          </View>
        )}

        {/* 本文（Markdown）または文字起こし */}
        <Surface style={styles.contentCard} elevation={0}>
          {showTranscription && note.transcription ? (
            <Text style={styles.transcriptionText}>{note.transcription}</Text>
          ) : (
            <Markdown style={markdownStyles}>{note.content}</Markdown>
          )}
        </Surface>
      </ScrollView>

      {/* タイトル編集ダイアログ */}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  title: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9CA3AF",
  },
  metaText: {
    color: "#6B7280",
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F3F4F6",
  },
  tagText: {
    color: "#374151",
    fontSize: 14,
  },
  tagInputContainer: {
    marginRight: 8,
  },
  tagInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    minWidth: 100,
  },
  addTagChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addTagText: {
    color: "#6B7280",
    fontSize: 14,
  },
  viewToggle: {
    marginBottom: 12,
  },
  viewToggleChip: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
  },
  viewToggleText: {
    color: "#2563EB",
    fontSize: 12,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
  },
  transcriptionText: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 24,
    padding: 8,
  },
  deleteText: {
    color: "#EF4444",
  },
});
