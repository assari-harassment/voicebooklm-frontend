import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HeaderButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { router } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { SettingsMenu } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';

const FEEDBACK_FORM_URL = 'https://forms.gle/PXkrsrkpikbKXHUk6';

const openFeedbackForm = async () => {
  try {
    await Linking.openURL(FEEDBACK_FORM_URL);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to open feedback form:', error);
    }
  }
};

/**
 * 全画面共通のヘッダー設定
 */
export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerBackTitle: '',
  headerTintColor: '#000',
  headerStyle: {
    backgroundColor: '#fff',
  },
  headerShadowVisible: false,
};

/**
 * index画面のヘッダー設定
 */
export const indexScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

/**
 * login画面のヘッダー設定
 */
export const loginScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

/**
 * home画面のヘッダー設定
 */
export const homeScreenOptions: NativeStackNavigationOptions = {
  title: '',
  headerLeft: ({ tintColor }) => (
    <HeaderButton
      onPress={() => {
        router.push('/search');
      }}
      accessibilityLabel="検索"
    >
      <MaterialCommunityIcons name="magnify" size={24} color={tintColor} />
    </HeaderButton>
  ),
  headerRight: ({ tintColor }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        onPress={openFeedbackForm}
        accessibilityLabel="フィードバック"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border.primary,
          backgroundColor: colors.bg.primary,
        }}
      >
        <MaterialCommunityIcons name="message-draw" size={16} color={colors.text.primary} />
        <Text style={{ marginLeft: 6, fontSize: 13, color: colors.text.primary }}>
          フィードバック
        </Text>
      </Pressable>
      <SettingsMenu tintColor={tintColor} />
    </View>
  ),
};

/**
 * note/[id]画面のヘッダー設定
 */
export const noteDetailScreenOptions: NativeStackNavigationOptions = {
  title: '',
  headerTransparent: true,
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerBlurEffect: undefined,
};

/**
 * record画面のヘッダー設定
 */
export const recordScreenOptions: NativeStackNavigationOptions = {
  title: '',
};

/**
 * search画面のヘッダー設定
 */
export const searchScreenOptions: NativeStackNavigationOptions = {
  title: '検索',
};
