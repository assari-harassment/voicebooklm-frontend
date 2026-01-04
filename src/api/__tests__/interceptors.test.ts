import { isRefreshTokenEndpoint } from '../interceptors';

describe('isRefreshTokenEndpoint', () => {
  describe('リフレッシュエンドポイントの判定', () => {
    it('正確なパスでtrueを返す', () => {
      expect(isRefreshTokenEndpoint('/api/auth/refresh')).toBe(true);
    });

    it('フルURLでもtrueを返す', () => {
      expect(isRefreshTokenEndpoint('https://api.example.com/api/auth/refresh')).toBe(true);
    });

    it('クエリパラメータ付きでもtrueを返す', () => {
      expect(isRefreshTokenEndpoint('/api/auth/refresh?foo=bar')).toBe(true);
    });

    it('複数のクエリパラメータ付きでもtrueを返す', () => {
      expect(isRefreshTokenEndpoint('/api/auth/refresh?foo=bar&baz=qux')).toBe(true);
    });
  });

  describe('非リフレッシュエンドポイントの判定', () => {
    it('他の認証エンドポイントはfalse', () => {
      expect(isRefreshTokenEndpoint('/api/auth/login')).toBe(false);
      expect(isRefreshTokenEndpoint('/api/auth/logout')).toBe(false);
      expect(isRefreshTokenEndpoint('/api/auth/me')).toBe(false);
      expect(isRefreshTokenEndpoint('/api/auth/google')).toBe(false);
    });

    it('一般的なAPIエンドポイントはfalse', () => {
      expect(isRefreshTokenEndpoint('/api/users')).toBe(false);
      expect(isRefreshTokenEndpoint('/api/voice/memos')).toBe(false);
    });

    it('パスの途中に含まれる場合はfalse', () => {
      expect(isRefreshTokenEndpoint('/api/auth/refresh/something')).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('undefinedはfalse', () => {
      expect(isRefreshTokenEndpoint(undefined)).toBe(false);
    });

    it('空文字はfalse', () => {
      expect(isRefreshTokenEndpoint('')).toBe(false);
    });

    it('nullライクな値はfalse', () => {
      expect(isRefreshTokenEndpoint(null as unknown as string)).toBe(false);
    });
  });
});
