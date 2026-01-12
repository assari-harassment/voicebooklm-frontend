# UIライブラリ スタイリングの注意点

## 概要

React Native Paper などのUIライブラリは独自のテーマシステムを持っており、
NativeWindの`className`よりも優先されることがある。
このドキュメントでは、よくある問題と解決パターンを記載する。

---

## React Native Paper

### 問題: テーマ色がNativeWindより優先される

React Native Paper（v5+）はMaterial Design 3のテーマを使用しており、
コンポーネントの背景色・テキスト色などは内部でテーマから取得される。

**影響を受けやすいコンポーネント:**

- `Surface` - 背景色がテーマのelevation colorになる
- `Card` - 同上
- `Button` - ボタンの色全般
- `Chip`, `Badge`, `FAB` など

**症状:**

- `className="bg-white"` や `className="bg-t-bg-primary"` が効かない
- 薄い紫やグレーがかった色になる（MD3のデフォルト）

### 解決パターン

#### パターン1: `style`プロパティで直接指定（推奨）

`style`プロパティはテーマより優先度が高いため、確実に上書きできる。

```tsx
// classNameでは効かない場合
<Surface style={{ backgroundColor: '...' }} />
<Card style={{ backgroundColor: '...' }} />
```

プロジェクトのデザイントークンを使用する場合は`colors`定数をインポート：

```tsx
import { colors } from '@/src/shared/constants';
<Surface style={{ backgroundColor: colors.bg.primary }} />;
```

#### パターン2: グローバルテーマのカスタマイズ

アプリ全体で色を変更したい場合は、`PaperProvider`にカスタムテーマを渡す。
ただし、影響範囲が大きいため慎重に検討すること。

### 判断フローチャート

```
classNameで色が効かない
    ↓
そのコンポーネントはUIライブラリ製か？
    ↓ Yes
style propで直接指定する
    ↓
色の値はcolors定数から取得（トークンの一貫性を保つ）
```

---

## 一般原則

1. **UIライブラリのコンポーネントはテーマが優先される**
   - classNameだけで色が変わらない場合は、styleプロパティを試す

2. **デバッグ方法**
   - 要素の実際のスタイルを確認（React DevToolsなど）
   - 極端な色（`red`など）をstyleで指定して反映されるか確認

3. **色の値は必ずデザイントークンから**
   - `style`で直接指定する場合も、`colors`定数を使用する
   - ハードコードの色（`'white'`, `'#fff'`など）は例外的な場合のみ

---

## 関連ドキュメント

- `nativewind_color_guidelines` - NativeWindでの色の使い方
- `tech_stack` - 使用しているUIライブラリ一覧
