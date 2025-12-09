import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { App, Button, Card, Form, Input, Tabs } from "antd";

import { useUserStore } from "../../store/userStore";

interface AuthFormValues {
  email: string;
  password: string;
}

const AuthPage = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useUserStore();

  const onFinish = async (values: AuthFormValues, type: "login" | "register") => {
    setLoading(true);
    try {
      const { email, password } = values;
      if (type === "login") {
        await login({ email, password });
      } else {
        await register({ email, password });
      }

      message.success(type === "login" ? "登录成功" : "注册成功");
      navigate("/");
      console.log(`${type} successful`);
    } catch {
      message.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form layout="vertical" onFinish={(values) => onFinish(values, "login")}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入有效的邮箱" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form layout="vertical" onFinish={(values) => onFinish(values, "register")}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入有效的邮箱" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    注册
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AuthPage;
