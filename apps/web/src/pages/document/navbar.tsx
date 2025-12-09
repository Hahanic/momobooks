import { Button, Dropdown, Flex, type MenuProps, Tooltip } from "antd";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  BoldIcon,
  CloudCheckIcon,
  FileIcon,
  FileJsonIcon,
  FilePenIcon,
  FilePlusIcon,
  GlobeIcon,
  ItalicIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  ShareIcon,
  StrikethroughIcon,
  Table,
  TextIcon,
  TrashIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";

import { useEditorStore } from "../../store/editorStore";

interface DocumentNavbarProps {
  title?: string;
  loading?: boolean;
}

const DocumentNavbar = ({ title, loading }: DocumentNavbarProps) => {
  const { editor } = useEditorStore();

  const isEditing = false;

  const menuItems: MenuProps["items"][] = [
    // File
    [
      {
        key: "Save",
        label: "Save",
        icon: (
          <span className="flex items-center">
            <FileIcon className="size-4" />
          </span>
        ),
        children: [
          {
            key: "JSON",
            label: "JSON",
            icon: <FileJsonIcon className="size-4" />,
            onClick: () => console.log(editor?.getJSON()),
          },
          {
            key: "PDF",
            label: "PDF",
            icon: <FileIcon className="size-4" />,
            onClick: () => window.print(),
          },
          {
            key: "HTML",
            label: "HTML",
            icon: <GlobeIcon className="size-4" />,
            onClick: () => console.log(editor?.getHTML()),
          },
          {
            key: "TEXT",
            label: "TEXT",
            icon: <TextIcon className="size-4" />,
            onClick: () => console.log(editor?.getText()),
          },
        ],
      },
      {
        key: "New Document",
        label: "New Document",
        icon: <FilePlusIcon className="size-4" />,
        onClick: () => window.open("/", "_blank"),
      },
      {
        type: "divider",
      },
      {
        key: "Rename",
        label: "Rename",
        icon: <FilePenIcon className="size-4" />,
        onClick: () => console.log("Rename"),
      },
      {
        key: "Remove",
        label: "Remove",
        icon: <TrashIcon className="size-4" />,
        danger: true,
      },
      {
        type: "divider",
      },
      {
        key: "Print",
        label: "Print",
        icon: <PrinterIcon className="size-4" />,
        extra: "Ctrl+P",
        onClick: () => window.print(),
      },
    ],
    // Edit
    [
      {
        key: "Undo",
        label: "Undo",
        icon: <Undo2Icon className="size-4" />,
        extra: "Ctrl+Z",
        onClick: () => editor?.chain().focus().undo().run(),
        disabled: !editor?.can().undo(),
      },
      {
        key: "Redo",
        label: "Redo",
        icon: <Redo2Icon className="size-4" />,
        extra: "Ctrl+Y",
        onClick: () => editor?.chain().focus().redo().run(),
        disabled: !editor?.can().redo(),
      },
    ],
    // Insert
    [
      {
        key: "Table",
        label: "Table",
        icon: (
          <span className="flex items-center">
            <Table className="size-4" />
          </span>
        ),
        children: [
          {
            key: "2 x 2",
            label: "2 x 2",
            onClick: () =>
              editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(),
          },
          {
            key: "3 x 3",
            label: "3 x 3",
            onClick: () =>
              editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          },
          {
            key: "4 x 4",
            label: "4 x 4",
            onClick: () =>
              editor?.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run(),
          },
        ],
      },
    ],
    // Format
    [
      {
        key: "text",
        label: "Text",
        icon: (
          <span className="flex items-center">
            <TextIcon className="size-4" />
          </span>
        ),
        children: [
          {
            key: "Bold",
            label: "Bold",
            icon: <BoldIcon className="size-4" />,
            extra: "Ctrl+B",
            onClick: () => editor?.chain().focus().toggleBold().run(),
          },
          {
            key: "Italic",
            label: "Italic",
            icon: <ItalicIcon className="size-4" />,
            extra: "Ctrl+I",
            onClick: () => editor?.chain().focus().toggleItalic().run(),
          },
          {
            key: "Underline",
            label: "Underline",
            icon: <UnderlineIcon className="size-4" />,
            extra: "Ctrl+U",
            onClick: () => editor?.chain().focus().toggleUnderline().run(),
          },
          {
            key: "Strikethrough",
            label: "Strikethrough",
            icon: <StrikethroughIcon className="size-4" />,
            extra: "Ctrl+S",
            onClick: () => editor?.chain().focus().toggleStrike().run(),
          },
        ],
      },
      {
        key: "Clear Formatting",
        label: "Clear Formatting",
        icon: <RemoveFormattingIcon className="size-4" />,
        onClick: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
      },
    ],
  ];

  return (
    <>
      <div className="flex items-center justify-center gap-0.5">
        <div className="flex flex-col">
          {/* 标题 和 云 */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <form className="relative w-fit max-w-[50vh]">
                <span className="invisible px-1.5 text-lg whitespace-pre">""</span>
                <input className="absolute inset-0 truncate bg-transparent px-1.5 text-lg text-black" />
              </form>
            ) : (
              <span
                onClick={() => {
                  console.log("TODO: Edit title");
                }}
                className="cursor-pointer truncate px-1.5 text-lg font-medium"
              >
                {loading ? "加载中..." : title || "未命名文档"}
              </span>
            )}
            <CloudCheckIcon className="size-4 text-blue-400" />
          </div>
          {/* 编辑菜单 */}
          <div className="hidden gap-1 sm:flex">
            {["File", "Edit", "Insert", "Format"].map((label, index) => (
              <Dropdown key={label} menu={{ items: menuItems[index] }}>
                <button className="rounded-sm px-2 py-0.5 text-sm font-normal transition-colors hover:bg-neutral-100">
                  {label}
                </button>
              </Dropdown>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden flex-1 justify-end gap-4 pr-4 sm:flex">
        <Flex align="center" gap="8px">
          <Button icon={<ShareIcon className="size-4" />}>Share</Button>
          <Tooltip title="搜索">
            <Button type="text" shape="circle" icon={<SearchOutlined />} />
          </Tooltip>
          <Tooltip title="新建">
            <Button type="text" shape="circle" icon={<PlusOutlined />} />
          </Tooltip>
        </Flex>
      </div>
    </>
  );
};

export default DocumentNavbar;
