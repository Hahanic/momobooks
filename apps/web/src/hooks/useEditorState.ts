import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Editor } from "@tiptap/react";

import { useEditorStore } from "../store/editorStore";

function shallowEqual(objA: unknown, objB: unknown): boolean {
  // 处理基本类型相等 (包括 NaN === NaN)
  if (Object.is(objA, objB)) return true;

  // 排除非对象类型和 null
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }

  // 此时我们确定它们是对象，可以断言为键值对结构
  // Record<string, unknown> 表示一个键为字符串，值为任意类型的对象
  const a = objA as Record<string, unknown>;
  const b = objB as Record<string, unknown>;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

export function useEditorState<T>(
  selector: (editor: Editor) => T,
  equalityFn: (a: T, b: T) => boolean = shallowEqual,
): T | undefined {
  const { editor } = useEditorStore();

  const selectorRef = useRef(selector);

  useLayoutEffect(() => {
    selectorRef.current = selector;
  });

  const [state, setState] = useState<T | undefined>(() => (editor ? selector(editor) : undefined));

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const newState = selectorRef.current(editor);
      setState((prevState) => {
        // 初始，直接更新
        if (prevState === undefined) return newState;
        // 相等，则不触发 React 更新
        if (equalityFn(prevState, newState)) return prevState;
        return newState;
      });
    };

    handler();

    editor.on("transaction", handler);

    return () => {
      editor.off("transaction", handler);
    };
  }, [editor, equalityFn]);

  return state;
}
