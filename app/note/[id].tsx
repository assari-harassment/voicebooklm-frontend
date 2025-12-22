import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
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
import { colors } from "../../src/constants/colors";

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
    body: { color: colors.text.primary, fontSize: 16, lineHeight: 24 },
    heading1: {
      fontSize: 24,
      fontWeight: "bold" as const,
      marginVertical: 10,
      color: colors.text.primary,
    },
    heading2: {
      fontSize: 20,
      fontWeight: "bold" as const,
      marginVertical: 8,
      color: colors.text.primary,
    },
    heading3: {
      fontSize: 18,
      fontWeight: "bold" as const,
      marginVertical: 6,
      color: colors.text.primary,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.brand[500],
      paddingLeft: 10,
      fontStyle: "italic" as const,
      color: colors.text.secondary,
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: colors.bg.tertiary,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      fontFamily: "System" as const,
    },
    code_block: {
      backgroundColor: colors.bg.tertiary,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontFamily: "System" as const,
    },
    list_item: { marginVertical: 4 },
    bullet_list: { marginVertical: 8 },
  };

  return (
    <View className="flex-1 bg-t-bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <IconButton
            icon="arrow-left"
            size={20}
            onPress={handleGoHome}
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
              titleStyle={{ color: colors.danger[500] }}
            />
          </Menu>
        </View>

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
        <View className="mb-4">
          <View className="flex-row flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                className="bg-t-bg-tertiary"
                textStyle={{ color: colors.text.primary, fontSize: 14 }}
              >
                #{tag}
              </Chip>
            ))}
            {isAddingTag ? (
              <View className="mr-2">
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
                  className="px-3 py-2 border border-t-brand-500 rounded-lg bg-t-bg-primary text-sm min-w-[100px]"
                  autoFocus
                />
              </View>
            ) : (
              <Chip
                icon="plus"
                onPress={() => setIsAddingTag(true)}
                className="bg-t-bg-primary border border-t-border-primary border-dashed"
                textStyle={{ color: colors.text.secondary, fontSize: 14 }}
              >
                タグを追加
              </Chip>
            )}
          </View>
        </View>

        {/* 表示切り替えインジケーター */}
        {note.transcription && (
          <View className="mb-3">
            <Chip
              icon={showTranscription ? "microphone" : "text-box"}
              className="self-start bg-t-brand-50"
              textStyle={{ color: colors.brand[600], fontSize: 12 }}
            >
              {showTranscription ? "文字起こし" : "AI要約"}
            </Chip>
          </View>
        )}

        {/* 本文（Markdown）または文字起こし */}
        <Surface className="bg-t-bg-primary rounded-xl p-1" elevation={0}>
          {showTranscription && note.transcription ? (
            <Text className="text-t-text-primary text-base leading-6 p-2">
              {note.transcription}
            </Text>
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
