import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Menu } from "antd";

import {
  ClockCircleOutlined,
  HomeOutlined,
  SearchOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { ListCollapseIcon, ListIndentDecreaseIcon } from "lucide-react";

import { useLayoutStore } from "../../../store/layoutStore";
import DocumentTree from "./DocumentTree";

// 常量定义
const MIN_WIDTH = 220;
const MAX_WIDTH = 600;

const staticMenuItems = [
  { key: "home", icon: <HomeOutlined />, label: "工作台" },
  { key: "recent", icon: <ClockCircleOutlined />, label: "最近使用" },
  { key: "starred", icon: <StarOutlined />, label: "我的收藏" },
  { key: "team", icon: <TeamOutlined />, label: "团队文档" },
];

const Sidebar = () => {
  const {
    sidebarWidth: globalWidth,
    isCollapsed,
    setSidebarWidth: setGlobalWidth,
    toggleCollapse,
  } = useLayoutStore();

  // 本地状态用于拖拽时的即时渲染
  const [localWidth, setLocalWidth] = useState(globalWidth);

  // 同步全局状态到本地
  useEffect(() => {
    setLocalWidth(globalWidth);
  }, [globalWidth]);

  // 拖拽
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const isResizingRef = useRef<boolean>(false);
  const widthRef = useRef<number>(localWidth);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = e.clientX;
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

    widthRef.current = newWidth;
    setLocalWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    setIsResizing(false);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    setGlobalWidth(widthRef.current);
  }, [setGlobalWidth]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 如果是折叠状态，不允许拖拽
      if (isCollapsed) return;

      isResizingRef.current = true;
      setIsResizing(true); // 触发状态更新，让 useEffect 去添加监听

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [isCollapsed],
  );

  // 清理副作用
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    // 清理函数：当 isResizing 变回 false 或组件卸载时自动执行
    // 依赖项变化，下一次执行之前执行
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="fixed z-20 h-full shrink-0 sm:static">
      <aside
        className="group relative h-full shrink-0 bg-[#F7F7F5]"
        style={{
          width: isCollapsed ? 0 : `${localWidth}px`,
          overflow: "hidden",
        }}
      >
        {/* 侧边栏内容容器 */}
        <div className="flex h-full flex-col overflow-hidden">
          {/* 顶部 Logo / 切换区 */}
          <div className="flex h-16 items-center px-3 py-4">
            {/* 收起按钮 */}
            <div className="opacity-50 transition-opacity hover:opacity-80">
              <Button
                icon={isCollapsed ? <ListCollapseIcon /> : <ListIndentDecreaseIcon />}
                onClick={toggleCollapse}
                type="text"
                className="hover:bg-gray-80 text-gray-400"
              />
            </div>
            <div className="ml-2 text-center text-lg text-gray-700">📚 Momobooks</div>
          </div>

          {/* 搜索与新建 */}
          <div className="mb-2 space-y-2 px-3">
            <div className="group/search relative cursor-pointer">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50">
                <SearchOutlined />
                <span>搜索</span>
                <span className="ml-auto text-xs text-gray-300">⌘K</span>
              </div>
            </div>

            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              className="border-none bg-blue-600 shadow-sm hover:bg-blue-500"
            >
              新建文档
            </Button> */}
          </div>

          {/* 菜单列表区域 */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
            <Menu
              mode="inline"
              defaultSelectedKeys={["home"]}
              items={staticMenuItems}
              style={{ backgroundColor: "#F7F7F5", border: "none" }}
            />
            <div className="px-4 py-2 text-xs font-medium text-gray-400 select-none">我的文档</div>
            <DocumentTree />
          </div>

          {/* 底部操作区 */}
          <div className="border-t border-gray-200 p-3 text-xs text-gray-400">Trash / Settings</div>
        </div>

        {/* 拽条 */}
        <div
          onMouseDown={handleMouseDown}
          className="group/resizer absolute top-0 right-[-7px] z-10 hidden h-full w-4 cursor-col-resize justify-center transition-all hover:right-[-7px] sm:flex"
        >
          {/* 视觉线：平时是边框颜色，hover 或拖拽时变蓝 */}
          <div
            className={`h-full w-px transition-colors duration-150 ${
              isResizing
                ? "w-0.5 bg-blue-500"
                : "bg-gray-200 group-hover/resizer:w-0.5 group-hover/resizer:bg-blue-500"
            } `}
          />
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
