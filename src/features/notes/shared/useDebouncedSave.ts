import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebouncedSaveOptions {
  value: string;
  initialValue: string; // APIから取得した初期値（これが変わった時のみlastSavedValueをリセット）
  delay?: number; // デフォルト: 1000ms
  onSave: (value: string) => Promise<void>;
}

interface UseDebouncedSaveResult {
  isSaving: boolean;
  isDirty: boolean;
  flush: () => Promise<void>;
}

/**
 * Controlled Componentパターン用のdebounce付き自動保存フック
 *
 * 外部から value と initialValue を受け取り、変更があると delay ms 後に自動保存される
 * - value: 現在の値（外部で管理）
 * - initialValue: APIから取得した初期値（これが変わった時のみlastSavedValueをリセット）
 * - onSave: 保存処理
 * - flush: 即座に保存（blur時など）
 * - isDirty: 未保存の変更があるか
 */
export function useDebouncedSave({
  value,
  initialValue,
  delay = 1000,
  onSave,
}: UseDebouncedSaveOptions): UseDebouncedSaveResult {
  const [isSaving, setIsSaving] = useState(false);

  // 最後に保存した値を追跡（不要な保存を避けるため）
  const lastSavedValueRef = useRef(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);

  // onSaveの参照を常に最新に保つ
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // 外部の initialValue が変わった場合（別メモへの遷移など）にリセット
  useEffect(() => {
    // 保存中でなく、かつ pending がない場合のみリセット
    if (!isSaving && pendingValueRef.current === null) {
      lastSavedValueRef.current = initialValue;
    }
  }, [initialValue, isSaving]);

  // isDirtyの計算
  const isDirty = value !== lastSavedValueRef.current;

  // 保存処理
  const save = useCallback(async (valueToSave: string) => {
    if (valueToSave === lastSavedValueRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRef.current(valueToSave);
      lastSavedValueRef.current = valueToSave;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // 値が変更された時にdebounceタイマーをセット
  useEffect(() => {
    // 初回レンダリングや外部リセット時はスキップ
    if (value === lastSavedValueRef.current) {
      return;
    }

    pendingValueRef.current = value;

    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 新しいタイマーをセット
    timeoutRef.current = setTimeout(() => {
      if (pendingValueRef.current !== null) {
        save(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, save]);

  // 即座に保存（blur時など）
  const flush = useCallback(async () => {
    // タイマーをキャンセル
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // pending があればそれを優先して保存し、なければ現在の値と最後に保存した値の差分を確認して保存
    if (pendingValueRef.current !== null) {
      await save(pendingValueRef.current);
      pendingValueRef.current = null;
    } else if (value !== lastSavedValueRef.current) {
      await save(value);
    }
  }, [save, value]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    isDirty,
    flush,
  };
}
