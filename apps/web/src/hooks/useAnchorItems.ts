import { useEffect, useState } from "react";

import { useEditorStore } from "../store/editorStore";

export interface AnchorItem {
  key: string;
  href: string;
  title: string;
  children?: AnchorItem[];
}

export const useAnchorItems = () => {
  const { editor } = useEditorStore();
  const [items, setItems] = useState<AnchorItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const rootItems: AnchorItem[] = [];
      // 使用栈来维护层级结构，初始放入一个虚拟根节点
      const stack: { level: number; children: AnchorItem[] }[] = [
        { level: 0, children: rootItems },
      ];

      editor.state.doc.descendants((node) => {
        if (node.type.name === "heading") {
          const id = node.attrs.id;
          const text = node.textContent;
          const level = node.attrs.level;

          if (id && text) {
            const newItem: AnchorItem = {
              key: id,
              href: `#${id}`,
              title: text,
              children: [],
            };

            // 向上回溯：如果当前标题级别 <= 栈顶标题级别，说明栈顶标题已经结束，出栈
            while (stack.length > 1 && stack[stack.length - 1].level >= level) {
              stack.pop();
            }

            // 将当前标题添加到栈顶标题的 children 中
            const parent = stack[stack.length - 1];
            parent.children?.push(newItem);

            // 将当前标题入栈，作为后续可能的子标题的父级
            stack.push({ level, children: newItem.children! });
          }
        }
      });

      // 如果 Anchor 内容没有变化，则不更新状态，避免不必要的渲染
      setItems((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(rootItems)) {
          return prev;
        }
        return rootItems;
      });
    };

    updateHeadings();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateHeadings, 500);
    };

    editor.on("update", debouncedUpdate);

    return () => {
      editor.off("update", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [editor]);

  return items;
};
