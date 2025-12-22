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
global.css                    → 色の実際の値を定義（ライト/ダーク両方）【単一の情報源】
tailwind.config.js            → CSS変数を参照するトークンを定義（t- プレフィックス）
src/constants/colors.ts       → ⚠️ 自動生成ファイル（直接編集禁止）
scripts/generate-colors.js    → global.css から colors.ts を生成するスクリプト
```

### 自動生成の仕組み

`src/constants/colors.ts` は `global.css` から自動生成されます。
インラインスタイルや React Native Paper の props で色を使用する際に必要です。

```bash
# colors.ts を再生成
npm run generate:colors
```

**重要**: 色を変更する場合は必ず `global.css` を編集し、上記コマンドを実行してください。
`colors.ts` を直接編集しても、次回の生成時に上書きされます。

## 新しい色が必要な場合

1. `global.css` の `:root` と `.dark` 両方に変数を追加
2. `tailwind.config.js` の `colors` に `t-` プレフィックス付きで参照を追加
3. `npm run generate:colors` を実行して `colors.ts` を再生成
4. このメモリファイルのトークン一覧を更新

## ダークモード

- `.dark` クラスが付与されると自動で色が切り替わる
- コンポーネント側で `dark:` プレフィックスは不要
- ダークモードの色は `global.css` の `.dark` セクションで定義

## インラインスタイル・propsでの使用

React Native Paper などのコンポーネント props でトークンカラーを使用する場合は、
`src/constants/colors.ts` からインポートして使用：

```tsx
import { colors } from "../src/constants/colors";

// MaterialCommunityIcons
<MaterialCommunityIcons color={colors.text.secondary} />

// React Native Paper のprops
<IconButton iconColor={colors.text.primary} />
<Chip textStyle={{ color: colors.brand[600] }} />
<Menu.Item titleStyle={{ color: colors.danger[500] }} />

// style prop
style={{ backgroundColor: colors.brand[500] }}
```

## 透明度が必要な場合

Hex形式のため `bg-t-brand-500/50` 記法は使用不可。以下の方法を使用：

```tsx
// opacity クラス併用
<View className="bg-t-brand-500 opacity-50" />
```

頻繁に使う透明度は `global.css` に追加することを検討。

## 例外: ブランドロゴ・外部アセット

以下のケースでは、直接色指定が許可されます

### 対象コンポーネント

- `src/components/GoogleLogo.tsx` - Googleブランドカラー
- その他外部サービスのロゴ（Apple, GitHub 等）

### 理由

外部ブランドのロゴは、各社のブランドガイドラインで色が厳密に規定されており、
ダークモード対応やプロジェクトのカラースキーム変更の影響を受けてはならないため。
