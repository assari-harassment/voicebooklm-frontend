// 画面/機能ごとのメッセージ（日本語のみ運用）
const auth = {
  login: {
    title: 'VoiceBookLM',
    subtitle: '話すだけで、AIが自動整理',
    googleButton: 'Googleでログイン',
    error: {
      generic: 'ログインに失敗しました',
      cancelled: 'ログインがキャンセルされました',
    },
  },
  logout: 'ログアウト',
  deleteAccount: 'アカウント削除',
};

const settings = {
  title: '設定',
  account: 'アカウント',
  deleteAccountConfirm: {
    title: 'アカウント削除',
    message: 'すべてのメモが完全に削除されます。この操作は取り消せません。',
    confirm: '削除する',
    cancel: 'キャンセル',
  },
  error: {
    deleteAccount: 'アカウント削除に失敗しました',
    logout: 'ログアウトに失敗しました',
  },
};

export default {
  tabOne: 'タブ1',
  auth,
  settings,
};

