import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Layout, Table, type TableProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";

import useSWR from "swr";

import type { IDocumentResponse } from "@momobooks/shared";

import docTableIcon from "../../assets/icon/doc_table.svg";
import libcIcon from "../../assets/icon/lib.svg";
import newdocIcon from "../../assets/icon/newdoc.svg";
import templatecIcon from "../../assets/icon/template.svg";
import trashcIcon from "../../assets/icon/trash.svg";
import { DocumentActions } from "../../components/document/DocumentActions";
import Navbar from "../../components/layout/Navbar";
import {
  getRecentDocuments,
  getSharedDocuments,
  getStarredDocuments,
} from "../../services/documentService";

type TableDataItem = IDocumentResponse & { last_visited?: string };

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "shared" | "starred">("recent");

  const getKey = () => {
    switch (activeTab) {
      case "recent":
        return "/document/recent";
      case "shared":
        return "/document/shared";
      case "starred":
        return "/document/starred";
    }
  };

  const getFetcher = () => {
    switch (activeTab) {
      case "recent":
        return getRecentDocuments;
      case "shared":
        return getSharedDocuments;
      case "starred":
        return getStarredDocuments;
    }
  };

  const { data: documents, isLoading } = useSWR(getKey(), getFetcher());

  const columns: TableProps<TableDataItem>["columns"] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center">
          <img src={docTableIcon} className="mr-2 size-4" alt="Document" />
          <span
            onClick={() => navigate(`/document/${record._id}`)}
            className="cursor-pointer truncate font-medium text-gray-700 hover:underline"
          >
            {text || "无标题"}
          </span>
        </div>
      ),
    },
    {
      title: activeTab === "recent" ? "最近访问" : "更新时间",
      dataIndex: activeTab === "recent" ? "last_visited" : "updatedAt",
      key: "time",
      render: (date) => (
        <span className="text-gray-500">{date ? new Date(date).toLocaleString() : "-"}</span>
      ),
    },
    {
      title: "所有者",
      dataIndex: "owner_id",
      key: "owner_id",
      render: () => <span className="text-gray-500">我</span>,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => <DocumentActions document={record} />,
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <div className="size-full">
      <div className="flex size-full flex-col print:block print:h-auto">
        {/* 顶部区域 */}
        <div className="sticky top-0 z-10 h-auto w-full shrink-0 bg-white px-3 print:hidden">
          <Navbar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">主页</h1>
            </div>
          </Navbar>
          <div className="mb-4 flex flex-wrap items-center justify-start gap-2">
            <div className="flex h-14 w-45 cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-200/60">
              <div className="flex w-full items-center">
                <img src={newdocIcon} className="size-6" alt="New Document" />
                <div className="ml-2 flex flex-col text-start">
                  <span className="text-sm font-medium text-gray-700">新建</span>
                  <span className="text-[12px] text-nowrap text-gray-500">新建文档开始协作</span>
                </div>
              </div>
            </div>
            <div className="flex h-14 w-45 cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-200/60">
              <div className="flex w-full items-center">
                <img src={templatecIcon} className="size-6" alt="Template Library" />
                <div className="ml-2 flex flex-col text-start">
                  <span className="text-sm font-medium text-gray-700">模板库</span>
                  <span className="text-[12px] text-nowrap text-gray-500">选择模板快速新建</span>
                </div>
              </div>
            </div>
            <div className="flex h-14 w-45 cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-200/60">
              <div className="flex w-full items-center">
                <img src={libcIcon} className="size-6" alt="Knowledge Library" />
                <div className="ml-2 flex flex-col text-start">
                  <span className="text-sm font-medium text-gray-700">新建知识库</span>
                  <span className="text-[12px] text-nowrap text-gray-500">让知识创造价值</span>
                </div>
              </div>
            </div>
            <div className="flex h-14 w-45 cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-200/60">
              <div className="flex w-full items-center">
                <img src={trashcIcon} className="size-6" alt="Trash" />
                <div className="ml-2 flex flex-col text-start">
                  <span className="text-sm font-medium text-gray-700">回收站</span>
                  <span className="text-[12px] text-nowrap text-gray-500">找回删除的文档</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 内容区域 */}
        <div className="mb-2 flex gap-6 px-3 text-[0.9rem] font-medium text-gray-500">
          <div>
            <button
              onClick={() => setActiveTab("recent")}
              className={`cursor-pointer ${activeTab === "recent" ? "text-blue-500" : ""}`}
            >
              最近访问
            </button>
          </div>
          <div>
            <button
              onClick={() => setActiveTab("shared")}
              className={`cursor-pointer ${activeTab === "shared" ? "text-blue-500" : ""}`}
            >
              与我共享
            </button>
          </div>
          <div>
            <button
              onClick={() => setActiveTab("starred")}
              className={`cursor-pointer ${activeTab === "starred" ? "text-blue-500" : ""}`}
            >
              收藏
            </button>
          </div>
        </div>
        <Layout className="flex-1 overflow-y-auto px-3">
          <Table<TableDataItem>
            className="text-nowrap"
            rowHoverable={false}
            columns={columns}
            dataSource={documents}
            rowKey="_id"
            loading={isLoading}
            pagination={false}
            rowSelection={rowSelection}
            scroll={{ x: "max-content" }}
          />
        </Layout>
      </div>
    </div>
  );
};

export default HomePage;
