import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Divider, List, Portal, Dialog, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuth } from './_layout';
import { authService } from '@/services/AuthService';

/**
 * 設定画面
 *
 * ログアウト、アカウント削除機能を提供。
 * Requirements: 10.12, 10.14, 12.1, 12.2, 12.3, 12.7, 12.8, 12.9
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ログアウト処理
   * Requirements: 10.12, 10.14
   */
  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut();
      // ログアウト後、ログイン画面へリダイレクト（_layout.tsx で自動処理）
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(t('settings.error.logout'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * アカウント削除確認ダイアログを表示
   * Requirements: 12.1
   */
  const showDeleteConfirmation = () => {
    setShowDeleteDialog(true);
  };

  /**
   * アカウント削除をキャンセル
   * Requirements: 12.8
   */
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  /**
   * アカウント削除を実行
   * Requirements: 12.3, 12.7, 12.9
   */
  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    setIsLoading(true);
    setError(null);

    try {
      await authService.deleteAccount();
      // 削除成功後、ログイン画面へリダイレクト（_layout.tsx で自動処理）
      await signOut();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(t('settings.error.deleteAccount'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ユーザー情報セクション */}
        {user && (
          <View style={styles.section}>
            <List.Section>
              <List.Subheader>{t('settings.account')}</List.Subheader>
              <List.Item
                title={user.name}
                description={user.email}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
            </List.Section>
          </View>
        )}

        <Divider />

        {/* エラーメッセージ */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* アクションセクション */}
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              {/* ログアウトボタン */}
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.button}
                icon="logout"
              >
                {t('auth.logout')}
              </Button>

              {/* アカウント削除ボタン */}
              <Button
                mode="outlined"
                onPress={showDeleteConfirmation}
                style={[styles.button, styles.deleteButton]}
                textColor="#D32F2F"
                icon="delete-forever"
              >
                {t('auth.deleteAccount')}
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      {/* アカウント削除確認ダイアログ */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={handleDeleteCancel}>
          <Dialog.Title>{t('settings.deleteAccountConfirm.title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('settings.deleteAccountConfirm.message')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDeleteCancel}>
              {t('settings.deleteAccountConfirm.cancel')}
            </Button>
            <Button onPress={handleDeleteConfirm} textColor="#D32F2F">
              {t('settings.deleteAccountConfirm.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  button: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: '#D32F2F',
  },
});
