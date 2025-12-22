/**
 * global.css から src/constants/colors.ts を自動生成するスクリプト
 *
 * 使い方:
 *   node scripts/generate-colors.js
 *
 * global.css の :root セクションをパースして colors.ts を生成します。
 * 色を変更する場合は global.css のみを編集し、このスクリプトを実行してください。
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const globalCssPath = path.join(rootDir, 'global.css');
const colorsOutputPath = path.join(rootDir, 'src', 'shared', 'constants', 'colors.ts');

// global.css を読み込み
const cssContent = fs.readFileSync(globalCssPath, 'utf-8');

// :root セクションから CSS 変数を抽出
const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
if (!rootMatch) {
  console.error('Error: :root section not found in global.css');
  process.exit(1);
}

const rootContent = rootMatch[1];

// CSS変数をパース（カテゴリとキーを分離）
const colors = {
  bg: {},
  text: {},
  border: {},
  brand: {},
  accent: {},
  success: {},
  danger: {},
  warning: {},
  info: {},
};

// 各行をパース
const lines = rootContent.split('\n');
for (const line of lines) {
  const match = line.match(/--color-(\w+)-(\w+):\s*(#[0-9a-fA-F]+)/);
  if (match) {
    const [, category, key, value] = match;
    if (colors[category]) {
      colors[category][key] = value.toLowerCase();
    }
  }
}

// TypeScript ファイルを生成
const generateSection = (name, obj, comment) => {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '';

  const props = entries
    .map(([key, value]) => {
      // 数字キーの場合はそのまま、文字列キーはキャメルケース
      const propKey = /^\d+$/.test(key) ? key : key;
      return `    ${propKey}: "${value}",`;
    })
    .join('\n');

  return `  // ${comment}
  ${name}: {
${props}
  },`;
};

const tsContent = `/**
 * デザイントークンカラー定数
 *
 * ⚠️ このファイルは自動生成されます。直接編集しないでください。
 * 色を変更する場合は global.css を編集し、以下のコマンドを実行してください:
 *
 *   npm run generate:colors
 *
 * global.css の CSS変数と同期している色定義です。
 * インラインスタイルや React Native Paper の props で使用する場合は、
 * このファイルからインポートして使用してください。
 *
 * className での使用時は \`t-\` プレフィックス付きのクラス名を使用してください。
 * 例: className="bg-t-bg-primary text-t-text-secondary"
 */

export const colors = {
${generateSection('bg', colors.bg, 'Background')}

${generateSection('text', colors.text, 'Text')}

${generateSection('border', colors.border, 'Border')}

${generateSection('brand', colors.brand, 'Brand (Blue - プライマリアクション)')}

${generateSection('accent', colors.accent, 'Accent (Purple - 装飾、カテゴリ)')}

${generateSection('success', colors.success, 'Success (Green - 成功、完了)')}

${generateSection('danger', colors.danger, 'Danger (Red - エラー、削除、録音)')}

${generateSection('warning', colors.warning, 'Warning (Orange - 警告、注意)')}

${generateSection('info', colors.info, 'Info (Cyan - 情報、ヒント)')}
} as const;

export type Colors = typeof colors;
`;

// ファイルを書き出し
fs.writeFileSync(colorsOutputPath, tsContent);
console.log('✅ Generated: src/shared/constants/colors.ts');
console.log('   Source: global.css :root section');
console.log('');
console.log('Parsed colors:');
for (const [category, values] of Object.entries(colors)) {
  const count = Object.keys(values).length;
  if (count > 0) {
    console.log(`   ${category}: ${count} colors`);
  }
}
