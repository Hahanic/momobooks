import { useNavigate } from "react-router-dom";

import { Avatar, Button, Dropdown, type MenuProps } from "antd";

import { LogoutOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";

import { useLayoutStore } from "../../../store/layoutStore";
import { useUserStore } from "../../../store/userStore";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed, toggleCollapse } = useLayoutStore();
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className="flex flex-col">
          <span className="font-medium">{user?.name || "User"}</span>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="z-10 flex h-16 shrink-0 items-center justify-between bg-white pr-4 print:hidden">
      {/* 收起按钮 */}
      {!isCollapsed ? (
        <></>
      ) : (
        <div className="opacity-50 transition-opacity hover:opacity-80">
          <Button
            icon={<MenuUnfoldOutlined />}
            onClick={toggleCollapse}
            type="text"
            className="hover:bg-gray-80 text-gray-400"
          />
        </div>
      )}
      {children}
      <div className="shrink-0">
        <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
          <Avatar
            size={32}
            src={user?.avatar ?? "/avatar.jpg"}
            icon={<UserOutlined />}
            className="cursor-pointer transition-opacity hover:opacity-80"
          />
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
