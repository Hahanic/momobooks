import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { App, Skeleton, Tree, type TreeDataNode } from "antd";

import { BookTextIcon, PlusIcon } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { type IDocumentResponse } from "@momobooks/shared";

import { createDocument, getDocuments } from "../../../services/documentService";
import { DocumentActions } from "../../document/DocumentActions";

// 定义回调函数的类型
type TreeActionHandlers = {
  onCreate: (parentId: string) => void;
};

const buildTree = (items: IDocumentResponse[], handlers: TreeActionHandlers): TreeDataNode[] => {
  const map = new Map();
  const roots: TreeDataNode[] = [];

  // Create nodes
  items.forEach((item) => {
    map.set(item._id, {
      key: item._id,
      // title 是整个节点内容的渲染区域
      title: (
        // group 类名，只有 hover 这个容器时，子元素 group-hover 才会生效
        <div className="group flex w-full items-center justify-between pr-1">
          {/* 左侧：标题文本 */}
          <span className="block flex-1 truncate pr-2" title={item.title}>
            {item.title}
          </span>

          {/* 右侧：操作按钮组 (默认隐藏，group hover 时显示) */}
          <div className="hidden items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:flex group-hover:opacity-100">
            {/* 按钮 1: 添加子文档 */}
            <div
              role="button"
              className="flex items-center justify-center rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation(); // 阻止冒泡，防止触发选中/跳转
                handlers.onCreate(item._id);
              }}
            >
              <PlusIcon size={16} />
            </div>

            {/* 按钮 2: 更多菜单 */}
            <DocumentActions document={item} />
          </div>
        </div>
      ),
      children: [],
      isLeaf: true,
    });
  });

  // Pass 2: Link parents
  items.forEach((item) => {
    const node = map.get(item._id);
    if (item.parent_id && map.has(item.parent_id)) {
      const parent = map.get(item.parent_id);
      parent.children.push(node);
      parent.isLeaf = false;
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const DocumentTree = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { message } = App.useApp();

  // 0. 获取文档列表数据
  const {
    data: documents,
    error,
    isLoading,
  } = useSWR<IDocumentResponse[]>("/document", getDocuments);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 1. 构建 parentMap
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!documents) return map;
    documents.forEach((doc) => {
      if (doc.parent_id) map.set(doc._id, doc.parent_id);
    });
    return map;
  }, [documents]);

  // 2. 处理自动展开
  useEffect(() => {
    if (id && documents) {
      let currentId: string | undefined = id;
      const pathKeys = new Set<string>();
      while (currentId) {
        const parentId = parentMap.get(currentId);
        if (parentId) {
          pathKeys.add(parentId);
          currentId = parentId;
        } else {
          currentId = undefined;
        }
      }
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        let hasChanges = false;
        pathKeys.forEach((key) => {
          if (!next.has(key)) {
            next.add(key);
            hasChanges = true;
          }
        });
        return hasChanges ? Array.from(next) : prev;
      });
    }
  }, [id, documents, parentMap]);

  // 定义动作处理逻辑
  const handlers: TreeActionHandlers = useMemo(
    () => ({
      onCreate: async (parentId) => {
        try {
          const newDoc = await createDocument({
            title: "无标题",
            parent_id: parentId,
          });
          message.success("创建成功");
          mutate("/document");
          // 自动展开父节点
          setExpandedKeys((prev) => [...prev, parentId]);
          navigate(`/document/${newDoc._id}`);
        } catch (error) {
          console.error(error);
          message.error("创建失败");
        }
      },
    }),
    [mutate, navigate, message],
  );

  // 3. 构建 TreeData
  const treeData = useMemo(() => {
    if (!documents) return [];
    return buildTree(documents, handlers);
  }, [documents, handlers]);

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      </div>
    );
  }

  if (error) {
    return <div className="px-3 py-2 text-sm text-red-500">加载文档失败</div>;
  }

  if (documents && documents.length === 0) {
    return (
      <div className="mx-4 text-[12px] text-gray-400">当前还没有文档，赶紧创建新文档试试吧！</div>
    );
  }

  return (
    <div className="w-full">
      <Tree
        className="doc-tree bg-transparent text-gray-600"
        style={{
          backgroundColor: "#F7F7F5",
          whiteSpace: "nowrap",
        }}
        styles={{
          item: { padding: "2px" },
          itemTitle: { fontSize: "15px" },
        }}
        blockNode
        showIcon
        selectedKeys={id ? [id] : []}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        treeData={treeData}
        icon={() => (
          <span className="inline-flex size-full items-center">
            <BookTextIcon size={16} className="text-gray-500" />
          </span>
        )}
        onSelect={(selectedKeys) => {
          if (selectedKeys.length > 0) {
            navigate(`/document/${selectedKeys[0]}`);
          }
        }}
        virtual={false}
      />
    </div>
  );
});

export default DocumentTree;
