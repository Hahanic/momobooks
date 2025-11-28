import { useEffect, useState } from "react";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";

import { createCollaborationProvider } from "../lib/yjs-provider";

function useCollaboration(documentId: string) {
  const [data, setData] = useState<{ ydoc: Y.Doc; provider: HocuspocusProvider } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !documentId) return;

    // 设置一个标志位，防止组件卸载后还在设置状态
    let isMounted = true;

    // 初始化
    const doc = new Y.Doc();
    const newProvider = createCollaborationProvider(documentId, token, doc);

    // 只有当组件依然挂载时，才更新状态
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({ ydoc: doc, provider: newProvider });
    }

    return () => {
      // 标记为已卸载
      isMounted = false;

      // 销毁连接
      newProvider.destroy();
      doc.destroy();
    };
  }, [documentId]);

  return data;
}

export default useCollaboration;
