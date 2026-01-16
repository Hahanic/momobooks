import { useEffect, useMemo, useState } from "react";

import { App, Avatar, Button, List, Modal, Select, Spin, Switch, Tag } from "antd";

import { UserOutlined } from "@ant-design/icons";
import { Globe, Lock, Trash2 } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { debounce } from "../../lib/utils";
import { authService } from "../../services/authService";
import { getDocument, updateDocument } from "../../services/documentService";
import { useUserStore } from "../../store/userStore";
import { type IDocumentResponse, type IUser } from "../../types/index.ts";

interface ShareDocumentModalProps {
  documentId: string;
  open: boolean;
  onCancel: () => void;
}

export const ShareDocumentModal = ({ documentId, open, onCancel }: ShareDocumentModalProps) => {
  const { user: currentUser } = useUserStore();
  const { mutate } = useSWRConfig();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  // 获取文档详情
  const { data: document, isLoading: isDocLoading } = useSWR<IDocumentResponse>(
    open && documentId ? `/document/${documentId}` : null,
    () => getDocument(documentId),
  );

  // 是否是所有者
  const isOwner = currentUser?._id === document?.owner_id;

  // 当前协作者和公开状态
  const [collaborators, setCollaborators] = useState<
    { user_id: string; role: "editor" | "viewer"; user_info?: IUser }[]
  >([]);
  const [isPublic, setIsPublic] = useState(false);

  // 搜索用户状态
  const [searchUsers, setSearchUsers] = useState<IUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string | undefined>(undefined);

  // 初始化状态，当文档加载时
  useEffect(() => {
    if (document) {
      setIsPublic(document.is_public);
      if (document.collaborators) {
        console.log(document);
        setCollaborators(document.collaborators);
      }
    }
  }, [document]);

  // 搜索用户
  const handleSearch = useMemo(() => {
    const loadOptions = async (value: string) => {
      if (!value) {
        setSearchUsers([]);
        return;
      }
      setFetchingUsers(true);
      try {
        const results = await authService.searchUsers(value);

        const filtered = results.filter(
          (u) => u._id !== currentUser?._id && u._id !== document?.owner_id,
        );

        setSearchUsers(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUsers(false);
      }
    };
    return debounce(loadOptions, 500);
  }, [currentUser, document]);

  const saveChanges = async (
    publicState: boolean,
    collabState: { user_id: string; role: "editor" | "viewer" }[],
  ) => {
    try {
      setLoading(true);
      await updateDocument(documentId, {
        is_public: publicState,
        collaborators: collabState.map((c) => ({ user_id: c.user_id, role: c.role })),
      });
      message.success("更新成功");
      mutate(`/document/${documentId}`);
    } catch (error) {
      console.error(error);
      message.error("更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserToAdd || !document) return;

    const userToAdd = searchUsers.find((u) => u._id === selectedUserToAdd);
    if (!userToAdd) return;

    if (collaborators.some((c) => c.user_id === userToAdd._id)) {
      message.warning("该用户已在协作者列表中");
      return;
    }

    const newCollaborator = {
      user_id: userToAdd._id,
      role: "editor" as const,
      user_info: userToAdd,
    };

    const newCollaborators = [...collaborators, newCollaborator];
    setCollaborators(newCollaborators);
    setSelectedUserToAdd(undefined);
    setSearchUsers([]);

    await saveChanges(isPublic, newCollaborators);
  };

  const handleRemoveCollaborator = async (userId: string) => {
    const newCollaborators = collaborators.filter((c) => c.user_id !== userId);
    setCollaborators(newCollaborators);
    await saveChanges(isPublic, newCollaborators);
  };

  const handleRoleChange = async (userId: string, newRole: "editor" | "viewer") => {
    const newCollaborators = collaborators.map((c) =>
      c.user_id === userId ? { ...c, role: newRole } : c,
    );
    setCollaborators(newCollaborators);
    await saveChanges(isPublic, newCollaborators);
  };

  const handlePublicChange = async (checked: boolean) => {
    setIsPublic(checked);
    await saveChanges(checked, collaborators);
  };

  if (!document || !documentId || !open) {
    return null;
  }

  return (
    <Modal title="分享文档" open={open} onCancel={onCancel} footer={null}>
      {isDocLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* 邀请用户 */}
          <div className="flex gap-2">
            <Select
              className="flex-1"
              showSearch
              placeholder="搜索用户邮箱或昵称邀请"
              filterOption={false}
              onSearch={handleSearch}
              notFoundContent={fetchingUsers ? <Spin size="small" /> : "未找到用户"}
              value={selectedUserToAdd}
              onChange={setSelectedUserToAdd}
              optionLabelProp="label"
              disabled={!isOwner}
            >
              {searchUsers.map((user) => (
                <Select.Option key={user._id} value={user._id} label={user.name}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={handleAddUser}
              disabled={!selectedUserToAdd || !isOwner}
              loading={loading}
            >
              邀请
            </Button>
          </div>

          {/* 是否公开 */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                {isPublic ? <Globe size={16} /> : <Lock size={16} />}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">公开访问</span>
                <span className="text-xs text-gray-500">
                  {isPublic ? "任何拥有链接的人都可以查看该文档" : "仅受邀用户可访问"}
                </span>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onChange={handlePublicChange}
              loading={loading}
              disabled={!isOwner}
            />
          </div>

          {/* 协作者列表 */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">协作者</span>
            <List
              itemLayout="horizontal"
              dataSource={[
                // Owner
                {
                  user_id: document.owner_id,
                  role: "owner",
                  user_info: document.owner_info,
                },
                ...collaborators,
              ]}
              renderItem={(item: {
                user_id: string;
                role: "owner" | "editor" | "viewer";
                user_info?: IUser;
              }) => (
                <List.Item
                  actions={
                    item.role === "owner"
                      ? []
                      : [
                          <Select
                            key="role"
                            size="small"
                            value={item.role}
                            variant="borderless"
                            onChange={(val) => handleRoleChange(item.user_id, val)}
                            options={[
                              { value: "editor", label: "可编辑" },
                              { value: "viewer", label: "仅查看" },
                            ]}
                            disabled={loading || !isOwner}
                          />,
                          <Button
                            key="remove"
                            type="text"
                            size="small"
                            danger
                            icon={<Trash2 size={14} />}
                            onClick={() => handleRemoveCollaborator(item.user_id)}
                            disabled={loading || !isOwner}
                          />,
                        ]
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.user_info?.avatar} icon={<UserOutlined />} />}
                    title={
                      <div className="flex items-center gap-2">
                        <span>{item.user_info?.name || "未知用户"}</span>
                        {item.role === "owner" && <Tag color="gold">所有者</Tag>}
                        {item.user_id === currentUser?._id && <Tag>我</Tag>}
                      </div>
                    }
                    description={item.user_info?.email}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
