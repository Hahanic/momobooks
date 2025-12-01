import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  sidebarWidth: number;
  isCollapsed: boolean;
  setSidebarWidth: (width: number) => void;
  toggleCollapse: () => void;
  isAnchorVisible: boolean;
  toggleAnchorVisibility: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // 侧边栏
      sidebarWidth: 240,
      isCollapsed: false,
      setSidebarWidth: (width) => {
        set({ sidebarWidth: width });
      },
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      // 锚点栏
      isAnchorVisible: true,
      toggleAnchorVisibility: () => set((state) => ({ isAnchorVisible: !state.isAnchorVisible })),
    }),
    {
      name: "momobooks-layout-storage",
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        isCollapsed: state.isCollapsed,
        isAnchorVisible: state.isAnchorVisible,
      }),
    },
  ),
);
