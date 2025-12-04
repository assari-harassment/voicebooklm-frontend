フロントエンド環境構築手順

前提条件

Node.js: v22.x
npm: v10.x以上
direnv: プロジェクトディレクトリに入ると自動的にNode.jsバージョンを切り替え
nvm (Node Version Manager): Node.jsバージョン管理ツール

環境セットアップ


1. direnvのインストール（一度だけ）

# Arch Linux
```
sudo pacman -S direnv
```
# macOS
```
brew install direnv
```
2. シェルに統合（一度だけ）

~/.zshrc または ~/.bashrc に以下を手動で追加：

# zshの場合
```zsh
eval "$(direnv hook zsh)"
```
# bashの場合
```bash
eval "$(direnv hook bash)"
```

設定後、ターミナルを再起動またはソースを再読み込み：
source ~/.zshrc  # または source ~/.bashrc

3. nvmのインストール（未インストールの場合）

# Arch Linux
```bash
sudo pacman -S nvm
source /usr/share/nvm/init-nvm.sh  # 現在のターミナルに適用
```
# macOS/Linux
```zsh
curl -o- curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | zsh
```
4. プロジェクトのセットアップ

# プロジェクトディレクトリに移動
```
cd voicebooklm-frontend
```
# direnvを許可（初回のみ）
direnv allow

# 自動的にNode.js v22がインストール・切り替えされます
# "direnv: loading .../voicebooklm-frontend/.envrc" と表示されればOK

5. バージョン確認

node -v   # v22.x.x と表示されることを確認
npm -v    # v10.x.x と表示されることを確認

代替: 手動でバージョン切り替え

direnvを使わない場合は、毎回手動で切り替えが必要です。

# プロジェクトディレクトリで実行

nvm install  # .nvmrcに記載されたバージョンをインストール

# ~/.npmrcにprefixが設定されている場合
```
nvm use --delete-prefix
```
# 通常の場合
```
nvm use
```
動作

注意: Node.js v22以外ではインストールがエラーになるよう制限されています。

1. 依存パッケージのインストール
```
npm install
```
# React Native本体、Expo SDK、周辺ライブラリがすべてインストールされます。

2. アプリ起動
```
npm run dev
```