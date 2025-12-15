import { useState } from "react";

import { App, Button, Modal, Table, Tooltip } from "antd";

import { RotateCcw, Trash2 } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { type IDocumentResponse } from "@momobooks/shared";

import {
  getTrashDocuments,
  permanentDeleteDocument,
  restoreDocument,
} from "../../services/documentService";

interface TrashDocumentModalProps {
  open: boolean;
  onCancel: () => void;
}

export const TrashDocumentModal = ({ open, onCancel }: TrashDocumentModalProps) => {
  const { data: documents, isLoading } = useSWR(open ? "/document/trash" : null, getTrashDocuments);
  const { mutate } = useSWRConfig();
  const { message, modal } = App.useApp();
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const handleRestore = async (id: string) => {
    try {
      setActionLoading((prev) => new Set(prev).add(id));
      await restoreDocument(id);
      message.success("文档已恢复");
      mutate("/document/trash");
      mutate("/document");
      mutate("/document/recent");
    } catch (error) {
      console.error(error);
      message.error("恢复失败");
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    modal.confirm({
      title: "彻底删除",
      content: "此操作无法撤销，确定要彻底删除该文档吗？",
      okText: "彻底删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          setActionLoading((prev) => new Set(prev).add(id));
          await permanentDeleteDocument(id);
          message.success("文档已彻底删除");
          mutate("/document/trash");
        } catch (error) {
          console.error(error);
          message.error("删除失败");
        } finally {
          setActionLoading((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      },
    });
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-medium">{text || "无标题"}</span>,
    },
    {
      title: "删除时间",
      dataIndex: "trashed_at",
      key: "trashed_at",
      render: (date: string) => (
        <span className="text-gray-500">{date ? new Date(date).toLocaleString() : "-"}</span>
      ),
    },
    {
      title: "所有者",
      dataIndex: "owner_id",
      key: "owner_id",
      render: () => <span className="text-gray-500">我</span>,
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: IDocumentResponse) => (
        <div className="flex gap-2">
          <Tooltip title="恢复">
            <Button
              type="text"
              icon={<RotateCcw size={16} />}
              loading={actionLoading.has(record._id)}
              onClick={() => handleRestore(record._id)}
            />
          </Tooltip>
          <Tooltip title="彻底删除">
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              loading={actionLoading.has(record._id)}
              onClick={() => handlePermanentDelete(record._id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Modal title="回收站" open={open} onCancel={onCancel} footer={null} width={800}>
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};
