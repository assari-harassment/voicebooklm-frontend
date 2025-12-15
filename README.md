# VoicebookLM
音声メモを録音し、文字起こし・管理を行うReact Nativeアプリケーションです。

## はじめに
### 前提条件
| ソフトウェア | バージョン | 確認コマンド |
| --- | --- | --- |
| **macOS** | 13.0+ | `sw_vers` |
| **Xcode** | 15.0+ | `xcodebuild -version` |
| **Android Studio** | Latest | - |
| **Node.js** | 18.x+ | `node -v` |
| **CocoaPods** | 1.14+ | `pod --version` |
| **Java (JDK)** | 17 | `java -version` |

### クイックスタート
```bash
# Node.js 依存関係のインストール
npm install

# ネイティブフォルダの生成（初回のみ必須）
# これにより android/ および ios/ フォルダが生成されます
npx expo prebuild

# ネイティブアプリのビルドと起動
# iOS (Macのみ)
npm run ios
# Android
npm run android

# 2回目以降、サーバーのみ起動する場合
npx expo start --dev-client
```

## 開発ガイド
このプロジェクトは **Expo Prebuild (CNG)** を採用しています。
`android/` および `ios/` フォルダは Git 管理対象外となっており、ビルド時に自動生成されます。

### 主なコマンド
| コマンド | 説明 |
| --- | --- |
| `npx expo prebuild` | ネイティブフォルダ(android/ios)を生成 |
| `npm run ios` | iOSアプリをビルド・インストールして起動 |
| `npm run android` | Androidアプリをビルド・インストールして起動 |
| `npx expo start --dev-client` | 開発サーバーを起動（アプリインストール済みの場合） |
| `npx expo prebuild --clean` | ネイティブフォルダを一度削除して再生成 |

### トラブルシューティング
ビルドエラーが発生した場合や、ネイティブ設定を変更した場合は、以下を試してください。

**ネイティブフォルダの再生成（推奨）**
```bash
# iOS
npx expo prebuild --platform ios --clean

# Android
npx expo prebuild --platform android --clean
```

**キャッシュのクリア**
```bash
# Metro Bundlerのキャッシュクリア
npx expo start --clear

# Watchmanのリセット（ファイルが見つからないエラー等の場合）
watchman watch-del-all
```

## 環境構築
### Node.js & Watchman のインストール
Homebrew を使用する場合（推奨）
```bash
# Homebrew のインストール（未インストールの場合）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js と Watchman のインストール
brew install node
brew install watchman
```

### Android 開発環境のセットアップ
1. **Android Studio** を公式サイトからダウンロードしてインストール。
2. Android Studio の "SDK Manager" から以下をインストール:
    - Android SDK Platform 34 (または最新)
    - Intel x86 Atom_64 System Image
    - Android SDK Build-Tools
3. 環境変数の設定:

**zsh の場合 (`~/.zshrc`):**
```zsh
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

**bash の場合 (`~/.bash_profile` または `~/.bashrc`):**
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bash_profile
source ~/.bash_profile
```

### Xcode のセットアップ
```bash
# Xcode コマンドラインツールのインストール
xcode-select --install

# ライセンスの同意
sudo xcodebuild -license accept

# CocoaPods のインストール
sudo gem install cocoapods
```

## プロジェクトのセットアップ
```bash
# リポジトリをクローン
git clone git@github.com:Fuku-x/voicebook-app.git
cd voicebook-app

# パッケージのインストール
npm install

# ネイティブディレクトリの生成 (必要な場合)
npx expo prebuild
```

## アプリケーションの実行

### 開発サーバーの起動 (推奨)
Metro Bundler を起動し、QRコードを表示します。実機 (Expo Go) での開発や、複数のプラットフォームを切り替えて開発する場合に便利です。
```bash
npm start
# または
npx expo start
```
- `i` を押すと iOS シミュレータで起動
- `a` を押すと Android エミュレータで起動
- `w` を押すと Web ブラウザで起動

### iOS
```bash
# シミュレータで実行
npm run ios

# 特定のデバイスを指定して実行する場合
npx expo run:ios --device "iPhone 15 Pro"
```

### Android
```bash
# エミュレータで実行 (エミュレータを事前に起動しておくか、コマンドが自動起動します)
npm run android
```

## 技術スタック
*   **Framework**: React Native (Expo SDK 54)
*   **Language**: TypeScript
*   **Styling**: NativeWind (Tailwind CSS)
*   **Icons**: Lucide React Native
*   **Markdown**: react-native-markdown-display

### 主要な依存関係
*   `expo`: ^54.0.0 - アプリケーションフレームワーク
*   `react-native`: 0.81.5 - モバイル開発プラットフォーム
*   `nativewind`: ^2.0.11 - ユーティリティファーストCSS
*   `lucide-react-native`: アイコンライブラリ

### テストについて
```bash
# テストの実行 (Jest)
npm test
```

## ビルド
### iOS ビルド (ローカル)
```bash
# Expo CLI を使用してネイティブプロジェクトをビルド
npx expo run:ios --configuration Release
```

### Android ビルド (ローカル)
```bash
# Expo CLI を使用してネイティブプロジェクトをビルド
npx expo run:android --variant release
```

## 開発ガイドライン
### ブランチ戦略
*   `main` - 本番リリース用
*   `develop` - 開発用メインブランチ
*   `feature/*` - 機能開発用
*   `fix/*` - バグ修正用

### コミットメッセージ
*   `feat`: 新機能の追加
*   `fix`: バグ修正
*   `docs`: ドキュメント更新
*   `style`: コードスタイル修正
*   `refactor`: リファクタリング
*   `test`: テスト追加・修正

## トラブルシューティング
### よくある問題
**シミュレータが見つからない場合**
```bash
# 利用可能なシミュレータを確認
xcrun simctl list devices available
```

**依存関係のエラー (iOS)**
```bash
# Pods を再インストール
cd ios
pod deintegrate
pod install
cd ..
```

**依存関係のエラー (Android)**
```bash
# Gradle クリーン
cd android
./gradlew clean
cd ..
```

## ライセンス
Private - All rights reserved
