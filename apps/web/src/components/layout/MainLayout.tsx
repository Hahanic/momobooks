import { Outlet } from "react-router-dom";

import { Layout } from "antd";

import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <Layout className="h-screen overflow-x-hidden">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />
        {/* Main content area */}
        <Layout className="grow">
          <Outlet />
        </Layout>
      </div>
    </Layout>
  );
};

export default MainLayout;
