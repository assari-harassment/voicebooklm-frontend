# フロントエンドアーキテクチャ設計

## 概要

本プロジェクトでは **Feature-Colocation（機能共置）アーキテクチャ** を採用する。
FSDのような複雑な多層構造ではなく、シンプルで直感的な構造を優先する。

## 設計原則

1. **機能で分ける** - 技術的な分類（components, hooks）ではなく、ビジネス機能で分ける
2. **コロケーション** - 関連するコードは近くに置く。コンポーネントとそのロジックは同じファイルに
3. **フラットに保つ** - フォルダ階層は浅く。深くても2階層まで
4. **必要になったら共通化** - 最初から shared に入れない。2箇所以上で使うようになったら移動
5. **ファイル名で中身が分かる** - 開かなくても何のファイルか推測できる命名

---

## レイヤーの設計思想

### app/ - ルーティング層

**思想**: Expo Router のファイルベースルーティング。URLパスとファイルパスが一致する。

- ファイル名がそのままURLになる（例: `app/home.tsx` → `/home`）
- 動的ルートは `[param]` で表現（例: `app/note/[id].tsx` → `/note/123`）
- この層にはビジネスロジックを書かない
- features/ のコンポーネントを import して配置するだけ

```tsx
// app/record.tsx - ルーティングのみ
import { RecordingScreen } from "@/features/recording";

export default function RecordPage() {
  return <RecordingScreen />;
}
```

### features/ - 機能層

**思想**: ビジネス機能ごとにコードをまとめる。その機能に必要なものは全て同じフォルダに。

- 1つの機能 = 1つのフォルダ
- コンポーネント、フック、型、サービスを同じ場所に置く
- 他の機能から参照する場合は `index.ts` 経由で export
- 機能内でしか使わないものは外に出さない

```
features/
  recording/     # 録音に関する全て
  notes/         # メモに関する全て
  folders/       # フォルダに関する全て
```

**ファイル内の構成**: 1ファイルに型・フック・コンポーネント・スタイルをまとめる

```tsx
// features/recording/RecordingWaveform.tsx

// --- 型定義（このコンポーネント専用） ---
interface Props {
  isRecording: boolean;
}

// --- カスタムフック（このコンポーネント専用） ---
function useWaveformAnimation() {
  // ...
}

// --- コンポーネント ---
export function RecordingWaveform({ isRecording }: Props) {
  const { ... } = useWaveformAnimation();
  return <View style={styles.container}>...</View>;
}

// --- スタイル ---
const styles = StyleSheet.create({
  container: { /* ... */ },
});
```

### shared/ - 共通層

**思想**: 2つ以上の機能で使うものだけを置く。最初からここに入れない。

- 共通UIコンポーネント（ボタン、ダイアログなど）
- 共通ユーティリティ（日付フォーマット、バリデーションなど）
- 共通型（User など複数機能で使う型）
- 共通フック（認証状態など）

**昇格のタイミング**: features/ 内で作ったものが2箇所以上で必要になったら shared/ に移動を考える

### api/ - APIレイヤー

**思想**: バックエンドとの通信に関するコードを集約。

- 自動生成された型定義
- APIクライアント
- 機能固有のAPI呼び出しは features/ 内に書いてもよい

---

## 判断基準

### ファイルを分割するタイミング

- 400行を超えたら分割を検討
- 迷ったらまず1ファイルに書く。大きくなったら分割

---

## やってはいけないこと

- `shared/` に最初から入れる（まず features に置く）
- 全コンポーネントを `components/` フォルダに入れる
- `app/` にビジネスロジックを書く
- 技術的な分類（components/, hooks/, services/）で深い階層を作る

---

## 他アーキテクチャとの比較

| 観点 | FSD | Atomic Design | Feature-Colocation |
|------|-----|---------------|-------------------|
| 学習コスト | 高（7層） | 中（5層） | **低（2層）** |
| 小規模アプリ | オーバーキル | やや過剰 | **ちょうど良い** |
| 関連ファイル発見 | 分散 | 分散 | **同じフォルダ** |
| 初心者向け | ✗ | △ | **◎** |
