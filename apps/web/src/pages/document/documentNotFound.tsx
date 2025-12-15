import { useNavigate } from "react-router-dom";

import { Button, Result } from "antd";

const DocumentNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-50">
      <Result
        status="404"
        title="文档不存在或无法访问"
        subTitle="该文档可能已被删除，或者您没有权限查看此文档。"
        extra={
          <Button type="primary" onClick={() => navigate("/home")}>
            返回主页
          </Button>
        }
      />
    </div>
  );
};

export default DocumentNotFound;
