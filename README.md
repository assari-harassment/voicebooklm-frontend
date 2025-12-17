# VoiceBookLM Frontend

音声メモを録音し、文字起こし・管理を行うReact Nativeアプリケーションです。  
React Native（Expo）で開発されています。

## はじめに

### 前提条件

開発環境の一貫性を保つため、以下のバージョンを導入してください。

| ソフトウェア       | バージョン              | 確認コマンド          |
| ------------------ | ----------------------- | --------------------- |
| **Xcode**          | 15.0+                   | `xcodebuild -version` |
| **Android Studio** | Latest                  | -                     |
| **direnv**         | 最新（Node 自動切替用） | `direnv --version`    |
| **nvm**            | Node Version Manager    | `nvm --version`       |

### クイックスタート

```bash
# リポジトリをクローン
git clone git@github.com:assari-harassment/voicebooklm-frontend.git
cd voicebooklm-frontend

# Node.js バージョンの自動適用（direnv + nvm使用）
direnv allow

# 依存関係のインストール
npm install

# ネイティブアプリのビルドと起動
# iOS (Macのみ)
npm run ios

# Android
npm run android

# 2回目以降、サーバーのみ起動する場合
npm run dev
# または
npx expo start --dev-client
```

### Watchman のインストール（推奨）

ファイル変更を高速に検知するツールです。Fast Refresh の速度と信頼性が向上します。

```bash
brew install watchman
```

## 環境セットアップ（初回のみ）

チーム開発でのバージョン差異トラブル防止のため、**direnv + nvm の導入を推奨**しています。

### 1. direnv のインストール

**Arch Linux**

```bash
sudo pacman -S direnv
```

**macOS**

```bash
brew install direnv
```

### 2. シェルへの設定追加

`.zshrc` または `.bashrc` に以下を追記してください。

**zsh の場合**

```zsh
eval "$(direnv hook zsh)"
source ~/.zshrc  # または source ~/.bashrc
```

### 3. nvm のインストール（未インストールの場合）

**Arch Linux**

```bash
sudo pacman -S nvm
source /usr/share/nvm/init-nvm.sh
```

**macOS / その他 Linux**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 4. Node.js バージョンの自動適用

プロジェクトディレクトリで以下を実行：

```bash
direnv allow
```

成功例：

```
direnv: loading .../voicebooklm-frontend/.envrc
```

バージョン確認：

```bash
node -v   # → v22.11.x
npm -v    # → 10.x.x 以上
```

### 5. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を開き、ローカル環境に必要な値を設定してください。

## 開発ガイド

このプロジェクトは **Expo Prebuild (CNG)** を採用しています。

### 主なコマンド

| コマンド                    | 説明                                        |
| --------------------------- | ------------------------------------------- |
| `npm run dev`               | 開発サーバーを起動                          |
| `npm run ios`               | iOSアプリをビルド・インストールして起動     |
| `npm run android`           | Androidアプリをビルド・インストールして起動 |
| `npx expo prebuild`         | ネイティブフォルダ(android/ios)を生成       |
| `npx expo prebuild --clean` | ネイティブフォルダを一度削除して再生成      |

### アプリケーションの実行

#### 開発サーバーの起動（推奨）

```bash
npm run dev
# または
npm start
```

- `i` を押すと iOS シミュレータで起動
- `a` を押すと Android エミュレータで起動
- `w` を押すと Web ブラウザで起動

### よく使うコマンド（開発サーバー起動中に）

| キー       | 説明               |
| ---------- | ------------------ |
| `r`        | アプリをリロード   |
| `m`        | 開発メニューを表示 |
| `Ctrl + C` | 開発サーバー停止   |

## コード品質チェック

このプロジェクトでは、コードの品質維持とフォーマット統一のために **ESLint** と **Prettier** を導入しています。

### ESLint

静的解析ツールです。バグの温床となるコードや、推奨されない書き方をチェックします。

**使用方法:**

```bash
# コードの静的解析を実行
npm run lint

# 自動修正可能な問題を修正
npm run lint -- --fix
```

**重要**: コミットする前に必ず `npm run lint` を実行し、エラーがないことを確認してください。

### Prettier

コードフォーマッターです。インデントや改行などのスタイルを自動で統一します。

```bash
# すべてのファイルをフォーマット
npm run format

# フォーマットが必要かチェック（CI/CDで使用）
npm run format:check
```

### 開発フロー・コミット前のルール

**重要**: コミットまたはプッシュする前に、必ず ESLint を実行してください。  
エラーや警告がある場合は修正してからコミットしてください。

### VSCode設定

VSCodeを使用している場合、保存時に自動でフォーマット・Lint修正が行われるように設定済みです。

1. **推奨拡張機能のインストール**
   - VSCodeを開くと推奨拡張機能の通知が表示されるので、「インストール」を選択してください。
   - 手動で入れる場合: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

2. **自動フォーマット**
   - `.vscode/settings.json` に設定が含まれており、ファイル保存時に自動で Prettier と ESLint が実行されます。

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

## 技術スタック

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Icons**: Lucide React Native
- **Markdown**: react-native-markdown-display

### 主要な依存関係

- `expo`: ^54.0.27 - アプリケーションフレームワーク
- `react-native`: 0.81.5 - モバイル開発プラットフォーム
- `nativewind`: ^2.0.11 - ユーティリティファーストCSS
- `lucide-react-native`: ^0.561.0 - アイコンライブラリ

## トラブルシューティング

### よくある問題

**ビルドエラーが発生した場合**

ネイティブフォルダの再生成（推奨）:

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

## ディレクトリ構成

```
voicebooklm-frontend/
├── app/                 # Expo Router ページコンポーネント
├── components/          # 再利用可能なUIコンポーネント
├── hooks/               # カスタム React Hooks
├── services/            # API通信・外部サービスロジック
├── assets/              # 画像・フォントなどの静的資産
├── .env.example         # 環境変数テンプレート
├── .envrc               # direnv 設定ファイル
├── .nvmrc               # Node.js バージョン指定
└── README.md            # このファイル
```
