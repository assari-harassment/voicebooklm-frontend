import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';

import { colors } from '@/src/shared/constants';

interface EditNameDialogProps {
  visible: boolean;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

/**
 * 名前編集ダイアログ
 */
export function EditNameDialog({
  visible,
  currentName,
  onSave,
  onCancel,
  isSaving,
}: EditNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setError('');
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('名前を入力してください');
      return;
    }
    if (trimmedName === currentName) {
      onCancel();
      return;
    }
    try {
      await onSave(trimmedName);
    } catch {
      setError('保存に失敗しました');
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setError('');
    onCancel();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleCancel} style={styles.dialog}>
        <Dialog.Title style={styles.title}>名前を編集</Dialog.Title>
        <Dialog.Content>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            mode="outlined"
            placeholder="名前を入力"
            autoFocus
            style={styles.input}
            outlineColor={colors.border.primary}
            activeOutlineColor={colors.brand[600]}
            error={!!error}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            onPress={handleCancel}
            mode="outlined"
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            onPress={handleSave}
            mode="contained"
            style={styles.saveButton}
            buttonColor={colors.brand[600]}
            labelStyle={styles.saveButtonLabel}
            loading={isSaving}
            disabled={isSaving}
          >
            保存
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.bg.primary,
    borderRadius: 16,
    marginHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.bg.primary,
  },
  errorText: {
    color: colors.danger[600],
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  cancelButton: {
    borderColor: colors.border.primary,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonLabel: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 8,
    flex: 1,
  },
  saveButtonLabel: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
});
