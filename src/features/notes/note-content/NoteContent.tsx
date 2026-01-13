import { colors } from '@/src/shared/constants';
import Markdown from 'react-native-markdown-display';
import { Surface, Text } from 'react-native-paper';

// スタイル
const markdownStyles = {
  body: { color: colors.text.primary, fontSize: 16, lineHeight: 24 },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginVertical: 10,
    color: colors.text.primary,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginVertical: 8,
    color: colors.text.primary,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginVertical: 6,
    color: colors.text.primary,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand[500],
    paddingLeft: 10,
    fontStyle: 'italic' as const,
    color: colors.text.secondary,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontFamily: 'System' as const,
  },
  code_block: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: 'System' as const,
  },
  list_item: { marginVertical: 4 },
  bullet_list: { marginVertical: 8 },
};

// 型定義
interface NoteContentProps {
  content: string;
  transcription?: string;
  showTranscription: boolean;
}

// コンポーネント
export function NoteContent({ content, transcription, showTranscription }: NoteContentProps) {
  return (
    <Surface className="bg-t-bg-primary rounded-xl p-1" elevation={0}>
      {showTranscription && transcription ? (
        <Text className="text-t-text-primary text-base leading-6 p-2">{transcription}</Text>
      ) : (
        <Markdown style={markdownStyles}>{content}</Markdown>
      )}
    </Surface>
  );
}
