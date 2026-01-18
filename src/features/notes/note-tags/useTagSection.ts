import { useCallback, useRef, useState } from 'react';
import type { TagInputRef } from './TagInput';

interface UseTagSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function useTagSection({ tags, onAddTag, onRemoveTag }: UseTagSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const [highlightedTagIndex, setHighlightedTagIndex] = useState<number | null>(null);
  const inputRef = useRef<TagInputRef>(null);

  // タグを追加（重複チェック付き）
  const addTag = useCallback(
    (tagName: string) => {
      const trimmed = tagName.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAddTag(trimmed);
        setInputValue('');
        setHighlightedTagIndex(null);
      } else if (trimmed) {
        // 重複時は入力だけクリア
        setInputValue('');
      }
    },
    [tags, onAddTag]
  );

  // 入力送信時の処理（Enter）
  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  }, [inputValue, addTag]);

  // キー入力ハンドラ
  const handleKeyPress = useCallback(
    (key: string) => {
      // カンマでタグ追加
      if (key === ',') {
        const value = inputValue.replace(/,/g, '').trim();
        if (value) {
          addTag(value);
          // カンマが入力された分をクリア
          setTimeout(() => setInputValue(''), 0);
        }
        return;
      }

      // Backspaceの処理
      if (key === 'Backspace') {
        if (inputValue === '' && tags.length > 0) {
          if (highlightedTagIndex !== null) {
            // ハイライト中のタグを削除
            onRemoveTag(tags[highlightedTagIndex]);
            setHighlightedTagIndex(null);
          } else {
            // 最後のタグをハイライト
            setHighlightedTagIndex(tags.length - 1);
          }
        } else {
          // 入力中はハイライト解除
          setHighlightedTagIndex(null);
        }
        return;
      }

      // Escapeでハイライト解除
      if (key === 'Escape') {
        setHighlightedTagIndex(null);
        inputRef.current?.blur();
        return;
      }

      // その他のキー入力でハイライト解除
      if (highlightedTagIndex !== null) {
        setHighlightedTagIndex(null);
      }
    },
    [inputValue, tags, highlightedTagIndex, addTag, onRemoveTag]
  );

  // 入力値の変更ハンドラ
  const handleChangeText = useCallback(
    (text: string) => {
      // カンマが含まれている場合、カンマ前の部分をタグとして追加
      if (text.includes(',')) {
        const parts = text.split(',');
        const tagPart = parts[0].trim();
        if (tagPart) {
          addTag(tagPart);
        }
        // カンマ後の部分を入力値として設定
        setInputValue(parts.slice(1).join(','));
        return;
      }
      setInputValue(text);
      // 入力があればハイライト解除
      if (text && highlightedTagIndex !== null) {
        setHighlightedTagIndex(null);
      }
    },
    [addTag, highlightedTagIndex]
  );

  // タグ削除ハンドラ
  const handleRemoveTag = useCallback(
    (tag: string) => {
      onRemoveTag(tag);
      setHighlightedTagIndex(null);
    },
    [onRemoveTag]
  );

  // セクションタップ時に入力フィールドにフォーカス
  const handleSectionPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    inputValue,
    inputRef,
    highlightedTagIndex,
    handleSubmit,
    handleKeyPress,
    handleChangeText,
    handleRemoveTag,
    handleSectionPress,
  };
}
