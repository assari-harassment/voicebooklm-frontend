/**
 * 検索クエリのパース結果
 * 将来的に title:, createdat: などの検索オプションも追加予定
 */
export interface ParsedSearchQuery {
  /** 抽出されたタグ一覧 */
  tags: string[];
  /** タグ以外のキーワード部分 */
  keyword: string;
  /** キャッシュ・重複判定用の正規化キー（タグ順序に依存しない） */
  normalizedKey: string;
  // 将来追加予定: 例）
  // title?: string;
  // createdAt?: { from?: Date; to?: Date };
}

// タグ検索パターン: #タグ名 または tag:タグ名（半角#と全角＃の両方に対応）
const TAG_PATTERN = /(?:[#＃]|tag:)(\S+)/g;

/**
 * 検索クエリをパースしてタグ・キーワード・正規化キーを抽出する
 *
 * @example
 * parseSearchQuery("#開発 #コード ミーティング")
 * // => { tags: ["開発", "コード"], keyword: "ミーティング", normalizedKey: "コード,開発|ミーティング" }
 *
 * parseSearchQuery("#コード #開発 ミーティング")
 * // => { tags: ["コード", "開発"], keyword: "ミーティング", normalizedKey: "コード,開発|ミーティング" }
 * // ↑ タグの順序が異なっても normalizedKey は同じ
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  const trimmed = query.trim();

  if (!trimmed) {
    return { tags: [], keyword: '', normalizedKey: '' };
  }

  // タグを抽出
  const tags: string[] = [];
  let match;
  // RegExp.exec は内部状態を持つため、毎回新しいインスタンスを使用
  const tagRegex = new RegExp(TAG_PATTERN.source, TAG_PATTERN.flags);
  while ((match = tagRegex.exec(trimmed)) !== null) {
    const tag = match[1];
    if (tag) {
      tags.push(tag);
    }
  }

  // タグ部分を除去してキーワードを抽出
  const keyword = trimmed.replace(TAG_PATTERN, '').trim().replace(/\s+/g, ' '); // 連続する空白を1つにまとめる

  // タグをソートして正規化キーを生成
  const normalizedTags = [...tags].sort().join(',');
  const normalizedKey = `${normalizedTags}|${keyword.toLowerCase()}`;

  return { tags, keyword, normalizedKey };
}
