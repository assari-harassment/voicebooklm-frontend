/**
 * expo-file-system の Web 向けモック
 * Web ではファイルシステム機能は使用できません
 */

export class File {
  uri: string;

  constructor(uri: string) {
    this.uri = uri;
    console.warn('[expo-file-system] File is not available on Web');
  }

  static async exists(): Promise<boolean> {
    return false;
  }

  async create(): Promise<void> {}
  async delete(): Promise<void> {}
  async copy(): Promise<void> {}
  async move(): Promise<void> {}

  text(): string {
    return '';
  }

  base64(): string {
    return '';
  }
}

export const Paths = {
  document: '',
  cache: '',
  appleSharedContainers: {},
};

export const FileSystem = {
  documentDirectory: '',
  cacheDirectory: '',
  readAsStringAsync: async () => '',
  writeAsStringAsync: async () => {},
  deleteAsync: async () => {},
  getInfoAsync: async () => ({ exists: false, isDirectory: false, size: 0 }),
  makeDirectoryAsync: async () => {},
  copyAsync: async () => {},
  moveAsync: async () => {},
};

export default FileSystem;
