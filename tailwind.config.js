/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS変数を参照し、ライト/ダーク自動切り替え
        // t- プレフィックスでプロジェクト独自のトークンであることを明示 (t- = token)

        // Background
        't-bg': {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },

        // Text
        't-text': {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },

        // Border
        't-border': {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
        },

        // Brand (プライマリアクション)
        't-brand': {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },

        // Accent (装飾、カテゴリ)
        't-accent': {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
        },

        // Success (成功、完了)
        't-success': {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
        },

        // Danger (エラー、削除、録音)
        't-danger': {
          50: 'var(--color-danger-50)',
          100: 'var(--color-danger-100)',
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
          700: 'var(--color-danger-700)',
        },

        // Warning (警告、注意)
        't-warning': {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },

        // Info (情報、ヒント)
        't-info': {
          50: 'var(--color-info-50)',
          100: 'var(--color-info-100)',
          500: 'var(--color-info-500)',
          600: 'var(--color-info-600)',
        },
      },
    },
  },
  plugins: [],
};
