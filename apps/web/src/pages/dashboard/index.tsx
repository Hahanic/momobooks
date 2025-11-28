import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, Input, message } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { createDocument } from "../../services/documentService";
import { useUserStore } from "../../store/userStore";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!user) {
      message.error("请先登录");
      return;
    }

    try {
      setLoading(true);
      const res = await createDocument({
        title: title || "未命名文档",
        parent_id: null,
      });

      if (res.data && res.data._id) {
        message.success("创建成功");
        navigate(`/document/${res.data._id}`);
      }
    } catch (error) {
      console.error(error);
      message.error("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">我的文档</h1>

      <Card title="新建文档" className="w-96 shadow-sm">
        <div className="flex flex-col gap-4">
          <Input
            placeholder="请输入文档标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPressEnter={handleCreate}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={loading}
            onClick={handleCreate}
            block
          >
            创建新文档
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
