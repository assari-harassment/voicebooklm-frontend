# NativeWind カラー運用ガイドライン

## 基本ルール

**色は必ず `t-` プレフィックス付きのデザイントークンを使用すること。**

- `t-` = **t**oken（プロジェクト独自のデザイントークンであることを明示）

### 禁止事項

```tsx
// ❌ 直接色指定は禁止
className="bg-white"
className="text-gray-500"
className="bg-blue-600"
className="border-gray-200"
style={{ color: '#3b82f6' }}

// ❌ t- プレフィックスなしも禁止
className="bg-brand-600"
className="text-success-500"
```

### 正しい使い方

```tsx
// ✅ t- プレフィックス付きトークンを使用
className="bg-t-bg-primary"
className="text-t-text-secondary"
className="bg-t-brand-600"
className="border-t-border-primary"
className="text-t-success-500"
```

## ファイル構成

```
global.css         → 色の実際の値を定義（ライト/ダーク両方）
tailwind.config.js → CSS変数を参照するトークンを定義（t- プレフィックス）
```

## 新しい色が必要な場合

1. `global.css` の `:root` と `.dark` 両方に変数を追加
2. `tailwind.config.js` の `colors` に `t-` プレフィックス付きで参照を追加
3. このメモリファイルのトークン一覧を更新

## ダークモード

- `.dark` クラスが付与されると自動で色が切り替わる
- コンポーネント側で `dark:` プレフィックスは不要
- ダークモードの色は `global.css` の `.dark` セクションで定義

## 透明度が必要な場合

Hex形式のため `bg-t-brand-500/50` 記法は使用不可。以下の方法を使用：

```tsx
// opacity クラス併用
<View className="bg-t-brand-500 opacity-50" />
```

頻繁に使う透明度は `global.css` に追加することを検討。
