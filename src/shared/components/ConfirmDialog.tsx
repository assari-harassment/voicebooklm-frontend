import { Platform, StyleSheet, View } from 'react-native';
import { Button, Dialog, Icon, Portal, Text } from 'react-native-paper';

import { colors } from '@/src/shared/constants';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  /** ダイアログの表示状態 */
  visible: boolean;
  /** ダイアログのタイトル */
  title: string;
  /** ダイアログのメッセージ */
  message: string;
  /** 確認ボタンのテキスト */
  confirmText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** ダイアログのバリアント（色テーマ） */
  variant?: ConfirmDialogVariant;
  /** 確認ボタン押下時のコールバック */
  onConfirm: () => void;
  /** キャンセルボタン押下時またはダイアログ外タップ時のコールバック */
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: 'alert-circle',
    iconBgColor: colors.danger[50],
    iconColor: colors.danger[600],
    confirmBgColor: colors.danger[600],
  },
  warning: {
    icon: 'alert',
    iconBgColor: colors.warning[50],
    iconColor: colors.warning[600],
    confirmBgColor: colors.warning[600],
  },
  info: {
    icon: 'information',
    iconBgColor: colors.info[50],
    iconColor: colors.info[600],
    confirmBgColor: colors.info[600],
  },
} as const;

/**
 * 確認ダイアログコンポーネント
 *
 * 削除や破棄などの確認が必要なアクションで使用する再利用可能なダイアログ。
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   visible={showDialog}
 *   title="本当に破棄しますか？"
 *   message="この操作は取り消せません。"
 *   confirmText="破棄する"
 *   cancelText="キャンセル"
 *   variant="danger"
 *   onConfirm={handleDiscard}
 *   onCancel={() => setShowDialog(false)}
 * />
 * ```
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={styles.dialog}>
        <View style={styles.content}>
          {/* アイコン */}
          <View style={[styles.iconContainer, { backgroundColor: config.iconBgColor }]}>
            <Icon source={config.icon} size={28} color={config.iconColor} />
          </View>

          {/* テキスト */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              contentStyle={styles.buttonContent}
            >
              {cancelText}
            </Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              style={styles.confirmButton}
              buttonColor={config.confirmBgColor}
              labelStyle={styles.confirmButtonLabel}
              contentStyle={styles.buttonContent}
            >
              {confirmText}
            </Button>
          </View>
        </View>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.bg.primary,
    borderRadius: 16,
    marginHorizontal: 24,
    ...(Platform.OS === 'web' && {
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
  },
  cancelButtonLabel: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
  },
  confirmButtonLabel: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContent: {
    height: 44,
  },
});
