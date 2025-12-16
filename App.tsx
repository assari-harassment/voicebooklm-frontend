import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic } from "lucide-react-native";
import { HomeScreen } from "./components/HomeScreen";
import { SearchScreen } from "./components/SearchScreen";
import { RecordScreen } from "./components/RecordScreen";
import { NoteDetailScreen } from "./components/NoteDetailScreen";
import { TranscriptEditScreen } from "./components/TranscriptEditScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AccountScreen } from "./components/AccountScreen";
import { StatusBar } from "expo-status-bar";

export type Note = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  date: Date;
  folder?: string;
};

export type TabType = "home" | "search" | "record" | "summary" | "account";

export type User = {
  name: string;
  email: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [notes, setNotes] = useState<Note[]>(() => {
    const generateNotes = (): Note[] => {
      const notesData: Note[] = [];
      const folders = [
        { name: "Projects", category: "Work", count: 12 },
        { name: "Meetings", category: "Work", count: 8 },
        { name: "Client Notes", category: "Work", count: 5 },
        { name: "Learning", category: "Personal", count: 15 },
        { name: "Ideas", category: "Personal", count: 9 },
        { name: "Reading Notes", category: "Personal", count: 7 },
        { name: "Old Projects", category: "Archive", count: 23 },
      ];

      const titles = [
        "プロジェクト計画書",
        "ミーティング議事録",
        "デザインレビュー",
        "コードレビュー",
        "週次報告",
        "月次レポート",
        "アイデアメモ",
        "学習ノート",
        "タスクリスト",
        "要件定義書",
        "システム設計",
        "API仕様書",
        "テスト計画",
        "リリースノート",
        "ブレインストーミング",
        "リサーチノート",
        "技術調査",
        "市場分析",
        "ユーザーインタビュー",
        "フィードバック",
        "改善提案",
        "バグ報告",
      ];

      const tags = [
        ["仕事", "プロジェクト"],
        ["ミーティング", "重要"],
        ["デザイン", "UI"],
        ["開発", "コード"],
        ["学習", "技術"],
        ["アイデア", "企画"],
        ["レビュー", "品質"],
        ["ドキュメント"],
        ["計画", "スケジュール"],
      ];

      let id = 1;
      folders.forEach((folder) => {
        for (let i = 0; i < folder.count; i++) {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 60));
          date.setHours(Math.floor(Math.random() * 24));
          date.setMinutes(Math.floor(Math.random() * 60));

          const title = `${
            titles[Math.floor(Math.random() * titles.length)]
          } #${i + 1}`;
          const selectedTags = tags[Math.floor(Math.random() * tags.length)];

          notesData.push({
            id: id.toString(),
            title,
            tags: selectedTags,
            summary: `## ${title}\n\nこれは${folder.name}フォルダーのメモです。\n\n### 概要\n本メモは自動生成されたテストデータです。実際のプロジェクトでは、ここに詳細な内容が記載されます。\n\n### ポイント\n- 項目1: 重要な内容\n- 項目2: 詳細情報\n- 項目3: 追加メモ\n\n> このメモは${folder.category}カテゴリーに属しています。`,
            date,
            folder: folder.name,
          });
          id++;
        }
      });

      // 元の3つのメモも追加
      notesData.push(
        {
          id: "1000",
          title: "プロジェクト会議の議事録",
          tags: ["仕事", "ミーティング", "重要"],
          summary: `## 会議概要\n本日のプロジェクト会議では、新機能のリリーススケジュールについて議論しました。\n\n### 主な決定事項\n- **β版リリース日**: 2024年12月15日\n- **フィードバック収集期間**: 2週間\n\n### UI/UXチームからの報告\nユーザビリティテストの結果が共有され、以下の改善が必要との指摘がありました：\n1. ナビゲーションの改善\n2. ボタン配置の最適化\n3. レスポンシブデザインの強化\n\n> 次回会議は12月20日を予定しています。`,
          date: new Date("2024-11-26T14:30:00"),
          folder: "Meetings",
        },
        {
          id: "1001",
          title: "読書メモ：デザイン思考",
          tags: ["学習", "読書", "デザイン"],
          summary: `# デザイン思考の5つのステップ\n\nデザイン思考のプロセスを通じて、**ユーザー中心の解決策**を見つけることができます。\n\n## プロセス\n1. **共感** - ユーザーの潜在的なニーズを理解する\n2. **問題定義** - 本質的な課題を明確にする\n3. **アイデア創出** - 多様な解決策を考える\n4. **プロトタイプ** - 具体的な形にする\n5. **テスト** - フィードバックを得る\n\n### ポイント\n特に*共感のフェーズ*では、ユーザーの潜在的なニーズを理解することが重要です。\n\n\`\`\`\n観察 → インタビュー → 分析\n\`\`\``,
          date: new Date("2024-11-25T09:15:00"),
          folder: "Reading Notes",
        },
        {
          id: "1002",
          title: "アプリアイデア：習慣トラッカー",
          tags: ["アイデア", "開発", "アプリ"],
          summary: `## コンセプト\n習慣を継続するためのシンプルなアプリ\n\n### 主な機能\n- 毎日の習慣をチェックリストで管理\n- 連続記録をビジュアル化\n- モチベーション維持のための仕組み\n\n### デザイン方針\n**Notion**のようなシンプルなインターフェース\n\n#### UI要素\n- カレンダービュー\n- ストリーク表示\n- 統計グラフ\n\n> シンプルで継続しやすいデザインを目指す`,
          date: new Date("2024-11-24T21:00:00"),
          folder: "Ideas",
        }
      );

      return notesData.sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    return generateNotes();
  });
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<{
    transcript: string;
    duration: number;
  } | null>(null);
  const [editingTranscript, setEditingTranscript] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    undefined
  );

  const handleTabChange = (tab: TabType) => {
    if (isRecording && tab !== "record") {
      Alert.alert("確認", "録音中です。移動すると録音が破棄されます。", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            setIsRecording(false);
            setRecordingData(null);
            setActiveTab(tab);
          },
        },
      ]);
      return;
    }

    setActiveTab(tab);

    // Record画面に遷移したら自動的に録音開始
    if (tab === "record") {
      setTimeout(() => setIsRecording(true), 0);
    }
  };

  const handleNoteClick = (noteId: string) => {
    setCurrentNoteId(noteId);
    setActiveTab("summary");
  };

  const handleBackToHome = () => {
    setActiveTab("home");
    setCurrentNoteId(null);
    setEditingTranscript("");
    setSelectedFolder(undefined);
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setActiveTab("search");
  };

  const handleRecordingComplete = (transcript: string, duration: number) => {
    setRecordingData({ transcript, duration });

    // 要約を生成（モック）
    const newNote: Note = {
      id: Date.now().toString(),
      title: "新しいメモ",
      tags: [],
      summary: `${transcript.slice(
        0,
        150
      )}...（要約版）\n\nこのメモは録音から自動生成されました。`,
      date: new Date(),
    };

    setNotes([newNote, ...notes]);
    setCurrentNoteId(newNote.id);
    setIsRecording(false);
    setActiveTab("summary");
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) => (note.id === noteId ? { ...note, ...updates } : note))
    );
  };

  const handleRegenerateSummary = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      const newSummary = `${note.summary}\n\n【再生成された要約】\nこの内容は再生成されました。より詳細な分析と構造化された情報が含まれています。`;
      handleUpdateNote(noteId, { summary: newSummary });
    }
  };

  const handleEditTranscript = (noteId: string, originalTranscript: string) => {
    setEditingTranscript(originalTranscript);
    setCurrentNoteId(noteId);
    setActiveTab("summary"); // 実際には編集モード
  };

  const handleTranscriptUpdate = (newTitle: string, newTranscript: string) => {
    if (currentNoteId) {
      const newSummary = `# ${newTitle}\n\n【編集された文字起こしから再生成】\n\n${newTranscript.slice(
        0,
        200
      )}...\n\nこの要約は編集された文字起こしから生成されました。`;
      handleUpdateNote(currentNoteId, { title: newTitle, summary: newSummary });
      setEditingTranscript("");
      setActiveTab("summary");
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId));
    // 削除したメモが現在開いているメモの場合、ホームに戻る
    if (currentNoteId === noteId) {
      setCurrentNoteId(null);
      setActiveTab("home");
    }
  };

  const renderScreen = () => {
    if (editingTranscript && activeTab === "summary" && currentNoteId) {
      const note = notes.find((n) => n.id === currentNoteId);
      if (note) {
        return (
          <TranscriptEditScreen
            title={note.title}
            transcript={editingTranscript}
            onSave={handleTranscriptUpdate}
            onCancel={() => {
              setEditingTranscript("");
              setActiveTab("summary");
            }}
          />
        );
      }
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            notes={notes}
            user={user}
            onNoteClick={handleNoteClick}
            onSearchClick={() => {
              setSelectedFolder(undefined);
              setActiveTab("search");
            }}
            onFolderClick={handleFolderClick}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
            onAccountClick={() => setActiveTab("account")}
          />
        );
      case "search":
        return (
          <SearchScreen
            notes={notes}
            onNoteClick={handleNoteClick}
            onBack={handleBackToHome}
            initialFolder={selectedFolder}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
          />
        );
      case "record":
        return (
          <RecordScreen
            isRecording={isRecording}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
            onComplete={handleRecordingComplete}
            onBack={handleBackToHome}
          />
        );
      case "summary":
        if (currentNoteId) {
          const note = notes.find((n) => n.id === currentNoteId);
          if (note) {
            return (
              <NoteDetailScreen
                note={note}
                onUpdateNote={handleUpdateNote}
                onRegenerateSummary={handleRegenerateSummary}
                onEditTranscript={handleEditTranscript}
                onDeleteNote={handleDeleteNote}
                onBack={handleBackToHome}
              />
            );
          }
        }
        return (
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-gray-400">メモを選択してください</Text>
          </View>
        );
      case "account":
        if (user) {
          return (
            <AccountScreen
              user={user}
              onBack={handleBackToHome}
              onUpdateUser={(updates) => {
                setUser({ ...user, ...updates });
              }}
              onLogout={() => {
                setUser(null);
                setIsAuthenticated(false);
                setActiveTab("home");
              }}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoginScreen
          onLogin={(userData) => {
            setUser(userData);
            setIsAuthenticated(true);
          }}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white relative"
      edges={["top", "left", "right"]}
    >
      <View className="flex-1">{renderScreen()}</View>

      {/* Floating Action Button */}
      {activeTab === "home" && (
        <TouchableOpacity
          onPress={() => handleTabChange("record")}
          className="absolute bottom-6 left-1/2 -ml-7 w-14 h-14 bg-blue-600 rounded-full shadow-lg items-center justify-center z-50"
          activeOpacity={0.8}
        >
          <Mic size={24} color="white" />
        </TouchableOpacity>
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
