// 型定義
export interface NoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  transcription?: string;
  date: Date;
}

// サンプルデータ
export const sampleNote: NoteData = {
  id: 'sample-note-id',
  title: '新しいメモ',
  content: `# 新しいメモ

これは音声から生成されたメモです。

## 主なポイント

- AIによって自動的に文字起こしされました
- 内容が整理されています
- タグを追加して管理できます`,
  tags: ['新規', 'AI生成'],
  date: new Date(),
};
