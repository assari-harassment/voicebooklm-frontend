import { useAuthStore } from '../authStore';

// Zustand store をリセットするヘルパー
const resetStore = () => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrated: false,
  });
};

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('初期状態', () => {
    it('デフォルトでは未認証状態', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('login', () => {
    it('トークンを設定し認証済み状態にする', async () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      await useAuthStore.getState().login(tokens);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('状態をクリアし未認証状態にする', async () => {
      // まずログイン
      await useAuthStore.getState().login({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      // ログアウト
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('トークンを同期的に設定する', () => {
      useAuthStore.getState().setTokens({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-access-token');
      expect(state.refreshToken).toBe('new-refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('ユーザー情報を設定する', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      useAuthStore.getState().setUser(user);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
    });

    it('nullを設定できる', () => {
      // まずユーザーを設定
      useAuthStore.getState().setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });

      // nullを設定
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('setLoading / setHydrated', () => {
    it('ローディング状態を設定できる', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('hydration状態を設定できる', () => {
      useAuthStore.getState().setHydrated(true);
      expect(useAuthStore.getState().isHydrated).toBe(true);
    });
  });

  describe('initialize', () => {
    it('トークンが存在する場合は認証済みにする', async () => {
      // 直接状態を設定
      useAuthStore.setState({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        isAuthenticated: false,
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('トークンがない場合は何もしない', async () => {
      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
