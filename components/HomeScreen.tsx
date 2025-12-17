import {
  Folder,
  Tag,
  ChevronRight,
  Search,
  FileText,
  MoreVertical,
} from "lucide-react-native";
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import type { Note, User } from "../App";
import { EditTitleModal } from "./EditTitleModal";

type HomeScreenProps = {
  notes: Note[];
  user: User | null;
  onNoteClick: (noteId: string) => void;
  onSearchClick: () => void;
  onFolderClick: (folderName: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onUpdateNote?: (noteId: string, updates: Partial<Note>) => void;
  onAccountClick: () => void;
};

export function HomeScreen({
  notes,
  user,
  onNoteClick,
  onSearchClick,
  onFolderClick,
  onDeleteNote,
  onUpdateNote,
  onAccountClick,
}: HomeScreenProps) {
  const recentNotes = notes.slice(0, 3);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    Work: true,
    Personal: true,
    Archive: false,
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const folderStructure = [
    {
      category: "Work",
      color: "bg-blue-500",
      folders: [
        { name: "Projects", indent: 1 },
        { name: "Meetings", indent: 1 },
        { name: "Client Notes", indent: 1 },
      ],
    },
    {
      category: "Personal",
      color: "bg-purple-500",
      folders: [
        { name: "Learning", indent: 1 },
        { name: "Ideas", indent: 1 },
        { name: "Reading Notes", indent: 1 },
      ],
    },
    {
      category: "Archive",
      color: "bg-gray-500",
      folders: [{ name: "Old Projects", indent: 1 }],
    },
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // フォルダー内のメモ数をカウント
  const getFolderCount = (folderName: string) => {
    return notes.filter((note) => note.folder === folderName).length;
  };

  const handleEditTitle = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditingTitle(note.title);
      setEditingNote(note);
      setIsEditModalOpen(true);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}/${day} ${hours}:${minutes}`;
  };

  const handleMenuPress = (note: Note) => {
    Alert.alert("メニュー", note.title, [
      { text: "編集", onPress: () => handleEditTitle(note.id) },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          if (onDeleteNote) {
            Alert.alert("削除の確認", "このメモを削除しますか？", [
              { text: "キャンセル", style: "cancel" },
              {
                text: "削除",
                style: "destructive",
                onPress: () => onDeleteNote(note.id),
              },
            ]);
          }
        },
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 96 }}
        stickyHeaderIndices={[0]}
      >
        {/* Header - Sticky */}
        <View className="bg-white pb-6 pt-2 z-10 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onAccountClick}
            className="flex-row items-center justify-center px-3 py-2 bg-gray-50 rounded-lg"
          >
            <Text className="text-sm text-gray-900 font-medium leading-none">
              {user?.name || "Workspace"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSearchClick}
            className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
            accessibilityLabel="検索"
          >
            <Search size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* 最近のメモ */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center gap-2">
            <View className="w-1 h-5 bg-blue-500 rounded-full" />
            <Text className="text-gray-900 font-bold text-lg">最近のメモ</Text>
          </View>
          <View className="gap-2">
            {recentNotes.map((note) => (
              <View
                key={note.id}
                className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3"
              >
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => onNoteClick(note.id)}
                    className="flex-1 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text
                        className="mb-1 text-gray-900 font-medium text-base"
                        numberOfLines={1}
                      >
                        {note.title}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <View className="w-1 h-1 rounded-full bg-gray-400" />
                        <Text className="text-sm text-gray-500">
                          {formatDate(note.date)}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>

                  {/* Menu Button */}
                  <TouchableOpacity
                    onPress={() => handleMenuPress(note)}
                    className="w-8 h-8 items-center justify-center rounded-lg ml-2"
                  >
                    <MoreVertical size={16} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* フォルダ一覧 */}
        <View className="pb-4">
          <View className="mb-3 flex-row items-center gap-2">
            <View className="w-1 h-5 bg-green-500 rounded-full" />
            <Text className="text-gray-900 font-bold text-lg">フォルダ</Text>
          </View>
          <View>
            {folderStructure.map((category) => (
              <View key={category.category}>
                <TouchableOpacity
                  onPress={() => toggleCategory(category.category)}
                  className="w-full flex-row items-center gap-2 px-3 py-3 rounded"
                >
                  <ChevronRight
                    size={16}
                    color="#6B7280"
                    style={{
                      transform: [
                        {
                          rotate: expandedCategories[category.category]
                            ? "90deg"
                            : "0deg",
                        },
                      ],
                    }}
                  />
                  <Folder size={20} color="#6B7280" />
                  <Text className="text-gray-700 font-medium">
                    {category.category}
                  </Text>
                </TouchableOpacity>

                {expandedCategories[category.category] && (
                  <View className="ml-6">
                    {category.folders.map((folder) => (
                      <TouchableOpacity
                        key={folder.name}
                        onPress={() => onFolderClick(folder.name)}
                        className="w-full flex-row items-center justify-between gap-2 px-3 py-3 rounded"
                      >
                        <View className="flex-row items-center gap-2 flex-1">
                          <FileText size={16} color="#9CA3AF" />
                          <Text className="text-gray-600" numberOfLines={1}>
                            {folder.name}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-400">
                          {getFolderCount(folder.name)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <EditTitleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={editingNote}
        onTitleChange={(newTitle) => {
          if (onUpdateNote && editingNoteId && editingNote) {
            const lines = editingNote.summary.split("\n");
            if (lines[0].startsWith("#")) {
              lines[0] = `# ${newTitle}`;
              const updatedSummary = lines.join("\n");
              onUpdateNote(editingNoteId, {
                title: newTitle,
                summary: updatedSummary,
              });
            } else {
              onUpdateNote(editingNoteId, { title: newTitle });
            }
          }
        }}
      />
    </View>
  );
}
