import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HeaderButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

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
  headerLeft: () => null,
  headerRight: ({ tintColor }) => (
    <HeaderButton
      onPress={() => {
        // TODO: Navigate to settings
      }}
      accessibilityLabel="設定"
    >
      <MaterialCommunityIcons name="cog" size={24} color={tintColor} />
    </HeaderButton>
  ),
};

/**
 * note/[id]画面のヘッダー設定
 */
export const noteDetailScreenOptions: NativeStackNavigationOptions = {
  title: '',
};

/**
 * record画面のヘッダー設定
 */
export const recordScreenOptions: NativeStackNavigationOptions = {
  title: '',
};

/**
 * processing画面のヘッダー設定
 */
export const processingScreenOptions: NativeStackNavigationOptions = {
  title: '処理中',
  headerBackVisible: false,
  gestureEnabled: false,
};
