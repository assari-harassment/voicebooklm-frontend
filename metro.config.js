const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Web 向けにモックするモジュール一覧
const webMocks = {
  'expo-file-system': path.resolve(__dirname, 'src/mocks/expo-file-system.ts'),
};

// ESM の exports フィールドを無視して CJS を使用（import.meta 問題回避）
// 注意: この設定は一部のパッケージが ESM exports を使用する際に
// Metro の Web バンドル時に import.meta が解決できない問題を回避するために必要
// 主な対象: @siteed/expo-audio-studio および関連パッケージ
// TODO: Metro の ESM サポートが改善されたら、この設定を削除して個別対応を検討
config.resolver.unstable_enablePackageExports = false;

// Web 向けのモジュール解決設定
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Web プラットフォームでネイティブモジュールをモックに置き換え
  if (platform === 'web' && webMocks[moduleName]) {
    return {
      filePath: webMocks[moduleName],
      type: 'sourceFile',
    };
  }
  // デフォルトの解決処理
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
