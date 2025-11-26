import { Outlet } from "react-router-dom";

import { Layout } from "antd";

import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <Layout className="h-screen w-full overflow-hidden print:h-auto print:overflow-visible">
      <div className="flex h-full w-full print:block print:h-auto">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <Layout className="h-full w-full flex-1 overflow-hidden print:h-auto print:overflow-visible">
          <Outlet />
        </Layout>
      </div>
    </Layout>
  );
};

export default MainLayout;
