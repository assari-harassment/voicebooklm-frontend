import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Menu, TouchableRipple, Text, IconButton } from 'react-native-paper';

import { colors } from '@/src/shared/constants';
import { useSettingsMenuStore } from '@/src/shared/stores/settingsMenuStore';

interface MenuItemConfig {
  icon: string;
  label: string;
  onPress: () => void;
}

interface SettingsMenuProps {
  /** アイコンの色 */
  tintColor?: string;
}

/**
 * 設定メニューコンポーネント
 *
 * 右上の歯車ボタンから開くドロップダウンメニュー。
 * 将来の設定機能追加用に準備。
 */
export function SettingsMenu({ tintColor = '#000' }: SettingsMenuProps) {
  const { isOpen, open, close } = useSettingsMenuStore();

  // 将来の設定項目はここに追加
  const menuItems: MenuItemConfig[] = [
    // 例: { icon: 'account', label: 'アカウント設定', onPress: () => {} },
  ];

  // メニュー項目がない場合は歯車アイコンのみ表示（クリックしても何もしない）
  if (menuItems.length === 0) {
    return (
      <IconButton
        icon="cog"
        iconColor={tintColor}
        size={24}
        onPress={() => {
          // TODO: 設定機能が追加されたらメニューを開く
        }}
        accessibilityLabel="設定"
      />
    );
  }

  return (
    <Menu
      visible={isOpen}
      onDismiss={close}
      anchor={
        <IconButton
          icon="cog"
          iconColor={tintColor}
          size={24}
          onPress={open}
          accessibilityLabel="設定"
        />
      }
      anchorPosition="bottom"
      contentStyle={styles.menuContent}
    >
      {menuItems.map((item) => (
        <TouchableRipple key={item.label} onPress={item.onPress} style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <MaterialCommunityIcons
              name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={20}
              color={colors.text.secondary}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </View>
        </TouchableRipple>
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuContent: {
    backgroundColor: colors.bg.primary,
    borderRadius: 8,
    marginTop: 4,
    minWidth: 200,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
