# React Native Web 固有の問題と対処法

> **トリガー**: Web版でのみエラー、`<button> cannot contain`、リロード時に消える

---

## 1. ボタンのネスト問題

**エラー**: `<button> cannot contain a nested <button>`

**原因**: `Pressable`, `TouchableOpacity`等がWebで`<button>`になり、ネスト不可

**対処**: 外側を`View`に変更し、タップイベントをプラットフォーム別に処理

```tsx
// NG: Pressable内にTouchableOpacity
<Pressable onPress={handlePress}>
  <TouchableOpacity onPress={handleDelete}>...</TouchableOpacity>
</Pressable>

// OK: 外側をViewに変更
<View
  {...(Platform.OS === 'web' ? { onClick: handlePress } : { onTouchEnd: handlePress })}
>
  <TouchableOpacity onPress={handleDelete}>...</TouchableOpacity>
</View>
```

**判断基準**: 内側のボタンが主要アクション → 外側をViewに変更

---

## 2. リロード時に戻るボタンが消える

**原因**: Webリロードでナビゲーション履歴がクリア、`canGoBack()`がfalse

**対処**: `headerLeft`を明示的に設定、履歴なしならホームへ

```tsx
headerLeft: ({ tintColor }) => (
  <HeaderButton
    onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}
  >
    <MaterialCommunityIcons name="arrow-left" size={24} color={tintColor} />
  </HeaderButton>
),
```

---

## 原則

- Web版でも必ず動作確認する
- `Platform.OS === 'web'`で分岐、スプレッド構文が便利
- `accessibilityLabel`は維持する
