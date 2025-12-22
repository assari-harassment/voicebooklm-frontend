import { colors } from '@/src/shared/constants';
import type { Note, User } from '@/src/shared/types';

// 型定義
export type FolderItem = {
  name: string;
  indent: number;
};

export type CategoryItem = {
  category: string;
  color: string;
  folders: FolderItem[];
};

// サンプルデータ
export const sampleNotes: Note[] = [
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

export const sampleUser: User = {
  name: '田中太郎',
  email: 'tanaka@example.com',
};

export const folderStructure: CategoryItem[] = [
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
