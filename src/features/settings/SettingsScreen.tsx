import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, TouchableRipple } from 'react-native-paper';

import { EditNameDialog } from './EditNameDialog';
import { apiClient } from '@/src/api';
import { ConfirmDialog } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';
import { useAuthStore } from '@/src/shared/stores/authStore';

/**
 * 設定画面
 *
 * プロフィール表示、名前編集、ログアウト機能を提供
 */
export function SettingsScreen() {
  const { user, logout, refreshToken, setUser } = useAuthStore();
  const [isEditNameDialogVisible, setEditNameDialogVisible] = useState(false);
  const [isLogoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditName = () => {
    setEditNameDialogVisible(true);
  };

  const handleSaveName = async (newName: string) => {
    setIsSaving(true);
    try {
      const updatedUser = await apiClient.updateProfile({ name: newName });
      setUser(updatedUser);
      setEditNameDialogVisible(false);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to update profile:', error);
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutPress = () => {
    setLogoutDialogVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogVisible(false);
    try {
      if (refreshToken) {
        await apiClient.logout(refreshToken);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Logout API call failed:', error);
      }
    }
    logout();
    router.replace('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogVisible(false);
  };

  return (
    <View className="flex-1 bg-t-bg-secondary">
      <ScrollView className="flex-1" contentContainerStyle={styles.scrollContent}>
        {/* プロフィールセクション */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {/* 名前 */}
            <TouchableRipple onPress={handleEditName} style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemLabel}>名前</Text>
                  <Text style={styles.itemValue}>{user?.name || '-'}</Text>
                </View>
                <View style={styles.editButton}>
                  <Text style={styles.editButtonText}>編集</Text>
                </View>
              </View>
            </TouchableRipple>

            <Divider style={styles.divider} />

            {/* メールアドレス */}
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemLabel}>メールアドレス</Text>
                  <Text style={styles.itemValue}>{user?.email || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ログアウトボタン */}
        <View style={styles.section}>
          <TouchableRipple onPress={handleLogoutPress} style={styles.logoutButton}>
            <View style={styles.logoutButtonContent}>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={colors.danger[600]}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutButtonText}>ログアウト</Text>
            </View>
          </TouchableRipple>
        </View>
      </ScrollView>

      {/* 名前編集ダイアログ */}
      <EditNameDialog
        visible={isEditNameDialogVisible}
        currentName={user?.name || ''}
        onSave={handleSaveName}
        onCancel={() => setEditNameDialogVisible(false)}
        isSaving={isSaving}
      />

      {/* ログアウト確認ダイアログ */}
      <ConfirmDialog
        visible={isLogoutDialogVisible}
        title="ログアウトしますか？"
        message="再度ログインすることで、メモを閲覧できます。"
        confirmText="ログアウト"
        cancelText="キャンセル"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
    color: colors.text.primary,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.bg.tertiary,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: colors.border.primary,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    color: colors.danger[600],
    fontWeight: '500',
  },
});
