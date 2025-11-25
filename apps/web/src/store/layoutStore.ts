import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  sidebarWidth: number;
  isCollapsed: boolean;
  setSidebarWidth: (width: number) => void;
  toggleCollapse: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarWidth: 240, // 默认宽度
      isCollapsed: false,
      setSidebarWidth: (width) => {
        console.log("设置侧边栏宽度:", width);
        set({ sidebarWidth: width });
      },
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "momobooks-layout-storage",
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        isCollapsed: state.isCollapsed,
      }),
    },
  ),
);
