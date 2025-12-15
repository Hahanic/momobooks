import { useNavigate } from "react-router-dom";

import { App, Dropdown, type MenuProps } from "antd";

import {
  CopyIcon,
  ExternalLinkIcon,
  FileSymlinkIcon,
  FolderInputIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinOffIcon,
  Share2Icon,
  StarIcon,
  Trash2Icon,
  UserCogIcon,
} from "lucide-react";
import { useSWRConfig } from "swr";

import { type IDocumentResponse } from "@momobooks/shared";

import {
  createDocument,
  deleteDocument,
  renameDocument,
  starDocument,
} from "../../services/documentService";

interface DocumentActionsProps {
  document: IDocumentResponse;
  trigger?: React.ReactNode;
}

export const DocumentActions = ({ document, trigger }: DocumentActionsProps) => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { message, modal } = App.useApp();

  const handleMenuClick: MenuProps["onClick"] = async ({ key, domEvent }) => {
    domEvent.stopPropagation();

    try {
      switch (key) {
        case "open_new_tab":
          window.open(`/document/${document._id}`, "_blank");
          break;

        case "copy_link":
          await navigator.clipboard.writeText(`${window.location.origin}/document/${document._id}`);
          message.success("链接已复制");
          break;

        case "new_child_document": {
          const newDoc = await createDocument({
            title: "无标题",
            parent_id: document._id,
          });
          message.success("创建成功");
          mutate("/document");
          navigate(`/document/${newDoc._id}`);
          break;
        }

        case "favorite":
          await starDocument(document._id);
          mutate(`/document/${document._id}`);
          mutate("/document/starred");
          break;

        case "rename": {
          const newTitle = window.prompt("请输入新标题", document.title);
          if (newTitle && newTitle !== document.title) {
            await renameDocument(document._id, { title: newTitle });
            message.success("重命名成功");
            mutate("/document");
            mutate("/document/recent");
          }
          break;
        }

        case "delete":
          modal.confirm({
            title: "确认删除",
            content: `确定要删除文档 "${document.title}" 吗？文档会在回收站中保留30天，期间可以恢复。`,
            okText: "删除",
            okType: "danger",
            cancelText: "取消",
            onOk: async () => {
              try {
                await deleteDocument(document._id);
                message.success("删除成功");
                mutate("/document");
                mutate("/document/recent");
                if (window.location.pathname === `/document/${document._id}`) {
                  navigate("/home");
                }
              } catch (error) {
                console.error(error);
                message.error("删除失败");
              }
            },
          });
          break;

        default:
          message.info("功能开发中...");
          break;
      }
    } catch (error) {
      console.error(error);
      message.error("操作失败");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "open_new_tab",
      label: "在新标签页打开",
      icon: <ExternalLinkIcon size={14} />,
    },
    {
      key: "share",
      label: "分享",
      icon: <Share2Icon size={14} />,
    },
    {
      key: "copy_link",
      label: "复制链接",
      icon: <LinkIcon size={14} />,
    },
    {
      type: "divider",
    },
    {
      key: "new_child_document",
      label: "新建子文档",
      icon: <FileSymlinkIcon size={14} />,
    },
    {
      key: "duplicate",
      label: "创建副本",
      icon: <CopyIcon size={14} />,
    },
    {
      key: "move_to",
      label: "移动到",
      icon: <FolderInputIcon size={14} />,
    },
    {
      key: "remove_pin",
      label: "从“置顶”移除",
      icon: <PinOffIcon size={14} />,
    },
    {
      key: "favorite",
      label: "收藏",
      icon: <StarIcon size={14} />,
    },
    {
      type: "divider",
    },
    {
      key: "transfer",
      label: "转移所有权",
      icon: <UserCogIcon size={14} />,
    },
    {
      key: "rename",
      label: "重命名",
      icon: <PencilIcon size={14} />,
    },
    {
      key: "delete",
      label: "删除",
      danger: true,
      icon: <Trash2Icon size={14} />,
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
      {trigger || (
        <div
          role="button"
          className="flex w-fit items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontalIcon size={16} />
        </div>
      )}
    </Dropdown>
  );
};
