import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { App, Avatar, Form, Input, Modal, Select, Spin, Switch } from "antd";

import { UserOutlined } from "@ant-design/icons";
import { useSWRConfig } from "swr";

import { type IUser } from "@momobooks/shared";

import { debounce } from "../../lib/utils";
import { authService } from "../../services/authService";
import { createDocument } from "../../services/documentService";

interface CreateDocumentModalProps {
  open: boolean;
  onCancel: () => void;
}

export const CreateDocumentModal = ({ open, onCancel }: CreateDocumentModalProps) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const handleSearch = useMemo(() => {
    const loadOptions = async (value: string) => {
      if (!value) {
        setUsers([]);
        return;
      }
      setFetchingUsers(true);
      try {
        const results = await authService.searchUsers(value);
        setUsers(results);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUsers(false);
      }
    };
    return debounce(loadOptions, 500);
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const collaborators = values.collaborators?.map((userId: string) => ({
        user_id: userId,
        role: "editor", // Default to editor
      }));

      const newDoc = await createDocument({
        title: values.title,
        is_public: values.is_public,
        collaborators,
      });

      message.success("创建成功");
      mutate("/document/recent");
      mutate("/document"); // Refresh sidebar
      navigate(`/document/${newDoc._id}`);
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error(error);
      // message.error("创建失败"); // validateFields throws error, don't show generic error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新建文档"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" initialValues={{ is_public: false }}>
        <Form.Item
          name="title"
          label="文档标题"
          rules={[{ required: true, message: "请输入标题" }]}
        >
          <Input placeholder="请输入文档标题" />
        </Form.Item>

        <Form.Item name="collaborators" label="邀请协作者">
          <Select
            mode="multiple"
            placeholder="搜索用户邮箱或昵称"
            showSearch={{ filterOption: false, onSearch: handleSearch }}
            notFoundContent={fetchingUsers ? <Spin size="small" /> : "No results found"}
            optionLabelProp="label"
          >
            {users.map((user) => (
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
        </Form.Item>

        <Form.Item name="is_public" label="公开访问" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
