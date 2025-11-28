import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, Form, Input, Tabs, message } from "antd";

import { authService } from "../../services/authService";
import { useUserStore } from "../../store/userStore";

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUserStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any, type: "login" | "register") => {
    setLoading(true);
    try {
      const { email, password } = values;
      let response;
      if (type === "login") {
        response = await authService.login(email, password);
      } else {
        response = await authService.register(email, password);
      }

      const { token, ...user } = response.data;
      login(user, token);
      message.success(type === "login" ? "登录成功" : "注册成功");
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
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
