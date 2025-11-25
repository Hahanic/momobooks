import { useState } from "react";

import { ColorPicker, Drawer, Dropdown, Input, Modal } from "antd";

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  GlobeIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  type LucideIcon,
  MessageSquarePlusIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { useEditorStore } from "../../store/editorStore";

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  className?: string;
}

// 标题级别按钮组件
const HeadingLevelButton = () => {
  const { editor } = useEditorStore();

  const headings = [
    { label: "Normal", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ];

  const getCurrentHeading = (): string => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`;
      }
    }
    return "Normal";
  };

  return (
    <Dropdown
      menu={{
        items: headings.map((item) => ({
          key: String(item.value),
          label: <span style={{ fontSize: item.fontSize }}>{item.label}</span>,
          onClick: () => {
            if (item.value === 0) {
              editor?.chain().focus().setParagraph().run();
            } else {
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: item.value as 1 | 2 | 3 | 4 | 5 })
                .run();
            }
          },
        })),
        selectable: true,
        selectedKeys: [
          String(
            headings.find((h) =>
              h.value === 0
                ? !editor?.isActive("heading")
                : editor?.isActive("heading", { level: h.value }),
            )?.value || "0",
          ),
        ],
      }}
      trigger={["click"]}
    >
      <button className="flex h-7 w-[100px] shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80">
        <span className="truncate">{getCurrentHeading()}</span>
        <span className="ml-2 text-xs opacity-50">▼</span>
      </button>
    </Dropdown>
  );
};

// 字体选择下拉菜单组件
const FontFamilyButtons = () => {
  const { editor } = useEditorStore();

  const fonts = [
    { label: "Arial", value: "Arial" },
    { label: "Georgia", value: "Georgia" },
    { label: "Impact", value: "Impact" },
    { label: "Tahoma", value: "Tahoma" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Verdana", value: "Verdana" },
  ];

  return (
    <Dropdown
      menu={{
        items: fonts.map((font) => ({
          key: font.value,
          label: (
            <span style={{ fontFamily: font.value }} className="text-sm">
              {font.label}
            </span>
          ),
          onClick: () => editor?.chain().focus().setFontFamily(font.value).run(),
        })),
        selectable: true,
        selectedKeys: fonts
          .filter((font) => editor?.isActive("textStyle", { fontFamily: font.value }))
          .map((f) => f.value),
      }}
      trigger={["click"]}
    >
      <button className="flex h-7 w-[100px] shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80">
        <span className="truncate">{editor?.getAttributes("textStyle").fontFamily || "Arial"}</span>
        <span className="ml-2 text-xs opacity-50">▼</span>
      </button>
    </Dropdown>
  );
};

// 字体大小按钮组件
const FontSizeButton = () => {
  const { editor } = useEditorStore();

  const currentFontSize = editor?.getAttributes("textStyle").fontSize || "16px";

  const [inputValue, setInputValue] = useState(currentFontSize.replace("px", ""));
  const [isEditing, setIsEditing] = useState(false);

  const updateFontSize = (newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor
        ?.chain()
        .focus()
        .setFontSize(size + "px")
        .run();
      setInputValue(size.toString());
      setIsEditing(false);
    } else {
      setInputValue(currentFontSize.replace("px", ""));
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    updateFontSize(inputValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFontSize(inputValue);
      editor?.commands.focus();
    }
  };

  const increment = () => {
    const size = parseInt(currentFontSize.replace("px", ""));
    updateFontSize((size + 1).toString());
  };

  const decrement = () => {
    const size = parseInt(currentFontSize.replace("px", ""));
    if (size > 1) {
      updateFontSize((size - 1).toString());
    }
  };

  return (
    <div className="flex items-center gap-x-0.5">
      <button
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-neutral-200/80"
        onClick={decrement}
      >
        <MinusIcon className="size-3" />
      </button>
      {isEditing ? (
        <input
          type="text"
          className="h-7 w-10 rounded-sm border border-neutral-300 bg-transparent p-0 text-center text-sm focus:ring-0 focus:outline-none"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      ) : (
        <button
          className="h-7 w-10 truncate rounded-sm border border-neutral-300 text-center text-sm hover:bg-neutral-200/80"
          onClick={() => {
            setIsEditing(true);
            setInputValue(currentFontSize.replace("px", ""));
          }}
          title="字体大小"
        >
          {currentFontSize.replace("px", "")}
        </button>
      )}
      <button
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-neutral-200/80"
        onClick={increment}
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  );
};

// 文本颜色按钮组件
const TextColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes("textStyle").color || "#000000";

  const onChange = (color: { toHexString: () => string }) => {
    editor?.chain().focus().setColor(color.toHexString()).run();
  };

  return (
    <ColorPicker
      value={value}
      onChange={onChange}
      presets={[
        {
          label: "主题颜色",
          colors: [
            "#000000",
            "#F5222D",
            "#FA541C",
            "#FA8C16",
            "#FADB14",
            "#52C41A",
            "#13C2C2",
            "#1890FF",
            "#2F54EB",
            "#722ED1",
            "#EB2F96",
            "#FFFFFF",
          ],
        },
      ]}
    >
      <button
        className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
        title="文本颜色"
      >
        <span className="-translate-y-px font-medium">A</span>
        <div
          className="h-0.5 w-4 -translate-y-[3px] rounded-sm"
          style={{ backgroundColor: value }}
        />
      </button>
    </ColorPicker>
  );
};

// 行高按钮组件
const LineHeightButton = () => {
  const { editor } = useEditorStore();

  const lineHeights = [
    { label: "Default", value: "normal" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  return (
    <Dropdown
      menu={{
        items: lineHeights.map((item) => ({
          key: item.value,
          label: item.label,
          onClick: () => editor?.chain().focus().setLineHeight(item.value).run(),
        })),
        selectable: true,
        selectedKeys: [editor?.getAttributes("textStyle").lineHeight || "normal"],
      }}
      trigger={["click"]}
    >
      <button
        className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
        title="行高"
      >
        <ListCollapseIcon className="size-4" />
      </button>
    </Dropdown>
  );
};

// 对齐方式按钮组件
const AlignButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: "Align Left",
      value: "left",
      icon: AlignLeftIcon,
    },
    {
      label: "Align Center",
      value: "center",
      icon: AlignCenterIcon,
    },
    {
      label: "Align Right",
      value: "right",
      icon: AlignRightIcon,
    },
    {
      label: "Align Justify",
      value: "justify",
      icon: AlignJustifyIcon,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: alignments.map((item) => ({
          key: item.value,
          label: (
            <span className="flex items-center gap-2">
              <item.icon className="size-4" />
              {item.label}
            </span>
          ),
          onClick: () => editor?.chain().focus().setTextAlign(item.value).run(),
        })),
        selectable: true,
        selectedKeys: [
          alignments.find((a) => editor?.isActive({ textAlign: a.value }))?.value || "left",
        ],
      }}
      trigger={["click"]}
    >
      <button
        className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
        title="对齐"
      >
        <AlignLeftIcon className="size-4" />
      </button>
    </Dropdown>
  );
};

// 列表按钮组件
const ListButton = () => {
  const { editor } = useEditorStore();

  const lists = [
    {
      label: "Bullet List",
      icon: ListIcon,
      isActive: editor?.isActive("bulletList") || false,
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: ListOrderedIcon,
      isActive: editor?.isActive("orderedList") || false,
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <Dropdown
      menu={{
        items: lists.map((item) => ({
          key: item.label,
          label: (
            <span className="flex items-center gap-2">
              <item.icon className="size-4" />
              {item.label}
            </span>
          ),
          onClick: item.onClick,
        })),
        selectable: true,
        selectedKeys: lists.filter((item) => item.isActive).map((item) => item.label),
      }}
      trigger={["click"]}
    >
      <button
        className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
        title="列表"
      >
        <ListIcon className="size-4" />
      </button>
    </Dropdown>
  );
};

// 图片按钮组件
const ImageButton = () => {
  const { editor } = useEditorStore();
  const [imageUrl, setImageUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run();
  };

  const onUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    };
    input.click();
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl);
      setImageUrl("");
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: "upload",
              label: "上传图片",
              icon: <UploadIcon className="size-4" />,
              onClick: onUpload,
            },
            {
              key: "url",
              label: "图片链接",
              icon: <GlobeIcon className="size-4" />,
              onClick: () => setIsDialogOpen(true),
            },
          ],
        }}
        trigger={["click"]}
      >
        <button
          className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
          title="插入图片"
        >
          <ImageIcon className="size-4" />
        </button>
      </Dropdown>

      <Modal
        title="插入图片链接"
        open={isDialogOpen}
        onOk={handleImageUrlSubmit}
        onCancel={() => setIsDialogOpen(false)}
      >
        <Input
          placeholder="https://example.com/image.png"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </Modal>
    </>
  );
};

// 链接按钮组件
const LinkButton = () => {
  const { editor } = useEditorStore();
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    const previousUrl = editor?.getAttributes("link").href;
    setValue(previousUrl || "");
    setIsOpen(true);
  };

  const handleOk = () => {
    if (value === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className={cn(
          "flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm hover:bg-neutral-200/80",
          editor?.isActive("link") && "bg-neutral-200/80",
        )}
        title="插入链接"
      >
        <Link2Icon className="size-4" />
      </button>
      <Modal
        title={editor?.isActive("link") ? "编辑链接" : "插入链接"}
        open={isOpen}
        onOk={handleOk}
        onCancel={() => setIsOpen(false)}
      >
        <Input
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Modal>
    </>
  );
};

// 单个工具栏按钮组件
const ToolbarButton = ({ onClick, isActive, icon: Icon, className }: ToolbarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-sm text-sm hover:bg-neutral-200/80",
        isActive && "bg-neutral-200/80",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
};

const ToolbarSeparator = () => <div className="mx-1 h-4 w-px bg-neutral-300" />;

const Toolbar = () => {
  const { editor } = useEditorStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="hidden w-full flex-wrap items-center sm:flex">
        {/* 历史记录 */}
        <div className="flex items-center gap-x-0.5">
          <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} icon={Undo2Icon} />
          <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} icon={Redo2Icon} />
          <ToolbarButton onClick={() => window.print()} icon={PrinterIcon} />
          <ToolbarButton
            onClick={() => {
              const current = editor?.view.dom.getAttribute("spellcheck");
              editor?.view.dom.setAttribute("spellcheck", current === "true" ? "false" : "true");
            }}
            icon={SpellCheckIcon}
          />
        </div>

        <ToolbarSeparator />

        {/* 文本样式 */}
        <div className="flex items-center gap-x-0.5">
          <HeadingLevelButton />
          <FontFamilyButtons />
          <FontSizeButton />
        </div>

        <ToolbarSeparator />

        {/* 字体格式 */}
        <div className="flex items-center gap-x-0.5">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive("bold")}
            icon={BoldIcon}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive("italic")}
            icon={ItalicIcon}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            isActive={editor?.isActive("underline")}
            icon={UnderlineIcon}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive("strike")}
            icon={StrikethroughIcon}
          />
          <TextColorButton />
          <ToolbarButton
            onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
            icon={RemoveFormattingIcon}
          />
        </div>

        <ToolbarSeparator />

        {/* 段落格式 */}
        <div className="flex items-center gap-x-0.5">
          <LineHeightButton />
          <AlignButton />
          <ListButton />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            isActive={editor?.isActive("taskList")}
            icon={ListTodoIcon}
          />
        </div>

        <ToolbarSeparator />

        {/* 插入元素 */}
        <div className="flex items-center gap-x-0.5">
          <ImageButton />
          <LinkButton />
          <ToolbarButton
            onClick={() => console.log("Add Comment")}
            isActive={editor?.isActive("pendingComment")}
            icon={MessageSquarePlusIcon}
          />
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="flex w-full items-center justify-between sm:hidden">
        <div className="scrollbar-hide flex items-center gap-x-2 overflow-x-auto">
          <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} icon={Undo2Icon} />
          <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} icon={Redo2Icon} />
          <div className="h-4 w-px bg-neutral-300" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive("bold")}
            icon={BoldIcon}
          />
          <TextColorButton />
          <ImageButton />
        </div>
        <ToolbarButton onClick={() => setIsMobileMenuOpen(true)} icon={MoreHorizontalIcon} />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="工具箱"
        placement="bottom"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        mask={false}
        styles={{ body: { padding: "12px" }, header: { padding: "8px" } }}
      >
        <div className="flex flex-col gap-4">
          {/* History */}
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-xs text-neutral-500">操作</span>
            <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} icon={Undo2Icon} />
            <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} icon={Redo2Icon} />
            <ToolbarButton onClick={() => window.print()} icon={PrinterIcon} />
          </div>
          {/* Typography */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500">排版</span>
            <div className="flex flex-wrap items-center gap-2">
              <HeadingLevelButton />
              <FontFamilyButtons />
              <FontSizeButton />
            </div>
          </div>
          {/* Format */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500">格式</span>
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive("bold")}
                icon={BoldIcon}
              />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive("italic")}
                icon={ItalicIcon}
              />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive("underline")}
                icon={UnderlineIcon}
              />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                isActive={editor?.isActive("strike")}
                icon={StrikethroughIcon}
              />
              <TextColorButton />
              <ToolbarButton
                onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
                icon={RemoveFormattingIcon}
              />
            </div>
          </div>
          {/* Paragraph */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500">段落</span>
            <div className="flex flex-wrap items-center gap-2">
              <LineHeightButton />
              <AlignButton />
              <ListButton />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                isActive={editor?.isActive("taskList")}
                icon={ListTodoIcon}
              />
            </div>
          </div>
          {/* Insert */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500">插入</span>
            <div className="flex flex-wrap items-center gap-2">
              <ImageButton />
              <LinkButton />
              <ToolbarButton
                onClick={() => console.log("Add Comment")}
                isActive={editor?.isActive("pendingComment")}
                icon={MessageSquarePlusIcon}
              />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Toolbar;
