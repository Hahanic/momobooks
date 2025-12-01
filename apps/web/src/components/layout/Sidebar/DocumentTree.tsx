import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Skeleton, Tree, type TreeDataNode } from "antd";

import { BookTextIcon } from "lucide-react";
import useSWR from "swr";

import { type IDocumentResponse } from "@momobooks/shared";

import { getDocuments } from "../../../services/documentService";

const DocumentTree = memo(() => {
  console.log("conponent: DocumentTree");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: documents,
    error,
    isLoading,
  } = useSWR<IDocumentResponse[]>("/document", getDocuments);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 构建 parentMap: 子节点 ID -> 父节点 ID
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!documents) return map;
    documents.forEach((doc) => {
      if (doc.parent_id) {
        map.set(doc._id, doc.parent_id);
      }
    });
    return map;
  }, [documents]);

  // 当 ID 变化或数据加载完成时，计算并展开所有父节点
  useEffect(() => {
    if (id && documents) {
      const keysToExpand = new Set(expandedKeys);
      let currentId: string | undefined = id;

      // 向上回溯，找到所有父节点
      while (currentId) {
        const parentId = parentMap.get(currentId);
        if (parentId) {
          keysToExpand.add(parentId);
          currentId = parentId;
        } else {
          currentId = undefined;
        }
      }
      setExpandedKeys(Array.from(keysToExpand));
    }
  }, [id, documents, parentMap]);

  const treeData = useMemo(() => {
    if (!documents) return [];
    const buildTree = (items: IDocumentResponse[]): TreeDataNode[] => {
      const map = new Map();
      const roots: TreeDataNode[] = [];

      items.forEach((item) => {
        map.set(item._id, {
          key: item._id,
          title: item.title,
          children: [],
          isLeaf: true,
        });
      });

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

    return buildTree(documents);
  }, [documents]);

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

  return (
    <div>
      <Tree
        style={{
          backgroundColor: "#F7F7F5",
          whiteSpace: "nowrap",
        }}
        styles={{
          item: { padding: "2px" },
          itemTitle: {
            fontSize: "15px",
          },
        }}
        blockNode
        showIcon
        selectedKeys={id ? [id] : []}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        treeData={treeData}
        icon={() => {
          return (
            <span className="inline-flex size-full items-center">
              <BookTextIcon size={16} className="text-gray-500" />
            </span>
          );
        }}
        onSelect={(selectedKeys) => {
          if (selectedKeys.length > 0) {
            navigate(`/document/${selectedKeys[0]}`);
          }
        }}
        className="bg-transparent text-gray-600"
        virtual={false}
      />
    </div>
  );
});

export default DocumentTree;
