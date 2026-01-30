import { create } from 'zustand';

interface SettingsMenuState {
  /** メニューの表示状態 */
  isOpen: boolean;
  /** メニューを開く */
  open: () => void;
  /** メニューを閉じる */
  close: () => void;
  /** メニューの表示状態を切り替える */
  toggle: () => void;
}

export const useSettingsMenuStore = create<SettingsMenuState>()((set, get) => ({
  isOpen: false,

  open: () => set({ isOpen: true }),

  close: () => set({ isOpen: false }),

  toggle: () => set({ isOpen: !get().isOpen }),
}));
