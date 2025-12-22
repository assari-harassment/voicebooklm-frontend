# expo-poc

Expo を使用したモバイルアプリの PoC プロジェクトです。

## VSCode 拡張機能

開発には以下の VSCode 拡張機能が必要です。プロジェクトを開くと自動でインストールを促されます。

| 拡張機能                                                                                 | 用途               |
| ---------------------------------------------------------------------------------------- | ------------------ |
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)     | 静的解析           |
| [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)   | コードフォーマット |
| [Expo Tools](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) | Expo 開発支援      |

## 環境構築

開発を始める前に、以下の環境をセットアップしてください。

### 必須ツール

| ツール   | バージョン | インストール方法                 |
| -------- | ---------- | -------------------------------- |
| Node.js  | 22.x       | 下記のバージョン管理ツールを使用 |
| npm      | 10.x 以上  | Node.js に同梱                   |
| Watchman | 最新       | `brew install watchman`（推奨）  |

### Node.js バージョン管理

[mise](https://mise.jdx.dev/) を使用してバージョンを統一しています。

```bash
# mise をインストール
brew install mise

# シェルに mise を設定（初回のみ）
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc

# Node.js をインストール
mise install
```

### iOS 開発（Mac のみ）

1. **Xcode** をインストール
   - App Store から [Xcode](https://apps.apple.com/app/xcode/id497799835) をインストール
   - バージョン 15.0 以上を推奨

2. **Xcode Command Line Tools** をインストール

   ```bash
   xcode-select --install
   ```

3. **iOS シミュレーター**を設定
   - Xcode を開く → Settings → Platforms → iOS シミュレーターをダウンロード

### Android 開発

1. **Android Studio** をインストール
   - [公式サイト](https://developer.android.com/studio) からダウンロード

2. **react native document** を参照
   - [公式サイト](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build)

```
   開発ビルドを作成する
   EAS CLIをインストールする
```

の部分はスキップ

### Expo Go（オプション - 実機テスト用）

実機でアプリを素早くテストしたい場合は、Expo Go アプリをインストールしてください：

> **Note**: Expo Go はサンドボックス環境のため、カスタムネイティブモジュールを使用する場合は開発ビルドが必要です。

## プロジェクトのセットアップ

1. リポジトリをクローン（`--recursive` でドキュメントも取得）

   ```bash
   git clone --recursive https://github.com/assari-harassment/voicebooklm-frontend.git
   cd voicebooklm-frontend

   # 既存のcloneでドキュメントが空の場合
   git submodule update --init
   ```

2. 依存関係をインストール

   ```bash
   npm install
   ```

3. アプリを起動

   ```bash
   npx expo start
   ```

4. シミュレーター/エミュレーターで実行
   - `i` キー: iOS シミュレーターで開く
   - `a` キー: Android エミュレーターで開く
   - `w` キー: Web ブラウザで開く

## 開発ビルド（Development Build）

ネイティブモジュールを使用する場合は、初回には開発ビルドが必要です。その後は`npx expo start`で開発ビルドを起動できます。

```bash
# iOS シミュレーター用
npx expo run:ios

# Android エミュレーター用
npx expo run:android
```

```
npx expo prebuild --clean && npx expo run:ios
```

### ドキュメントの更新

`docs/` は voicebooklm-docs リポジトリの submodule です。最新のドキュメントを取得するには：

```bash
git submodule update --remote
```

詳しくは`git submodule`で検索

## 利用可能なスクリプト

| コマンド          | 説明                                 |
| ----------------- | ------------------------------------ |
| `npm start`       | 開発サーバーを起動                   |
| `npm run ios`     | iOS で実行（`expo run:ios`）         |
| `npm run android` | Android で実行（`expo run:android`） |
| `npm run web`     | Web ブラウザで実行                   |
| `npm run lint`    | ESLint でコードをチェック            |

## 参考リンク

- [Expo ドキュメント](https://docs.expo.dev/)
- [環境構築ガイド](https://docs.expo.dev/get-started/set-up-your-environment/)
- [React Native ドキュメント](https://reactnative.dev/)

## Claude Code / AI アシスタント

このプロジェクトは Claude Code での開発を想定しています。

### セットアップ

```bash
# Serena（コード解析）を使うには uvx が必要
pip install uv
```

### 利用可能な機能

| 機能                    | 説明                                       |
| ----------------------- | ------------------------------------------ |
| **Serena**              | コードのシンボル解析・リファクタリング支援 |
| **Context7**            | 最新のライブラリドキュメント取得           |
| **sequential-thinking** | 複雑な問題の思考整理                       |
| **/commit**             | 日本語コミットメッセージ自動生成           |

### ドキュメント参照

`docs/` に仕様書・設計書があります。Claude Code は自動的にこれらを参照します。
