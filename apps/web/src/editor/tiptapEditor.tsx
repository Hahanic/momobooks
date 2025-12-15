import { memo, useEffect } from "react";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import CodeBlock from "@tiptap/extension-code-block";
import Collaboration from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, LineHeight, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";

import { type IUser } from "@momobooks/shared";

import { stringToColor } from "../lib/utils";
import { useEditorStore } from "../store/editorStore";
import CustomHeading from "./extensions/heading";

interface TiptapEditorProps {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  user: IUser | null;
  editable: boolean;
}

const TiptapEditor = memo(({ ydoc, provider, user, editable }: TiptapEditorProps) => {
  const { setEditor, setProvider } = useEditorStore();

  const editor = useEditor(
    {
      editable,
      editorProps: {
        attributes: {
          class:
            "ProseMirror focus:outline-none print:border-0 max-w-205 bg-white min-h-[1054px] flex flex-col text-4 px-4 py-6",
        },
      },
      extensions: [
        StarterKit.configure({
          heading: false,
          undoRedo: false,
          codeBlock: false,
        }),
        CustomHeading,
        CodeBlock.configure({
          enableTabIndentation: true,
          tabSize: 2,
        }),
        TextStyle,
        FontFamily,
        FontSize,
        LineHeight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Color,
        Highlight.configure({ multicolor: true }),
        Image.configure({
          inline: true,
          resize: { enabled: true, minWidth: 50, minHeight: 50, alwaysPreserveAspectRatio: true },
        }),
        TaskItem.configure({ nested: true }),
        TaskList,
        TableKit.configure({ table: { resizable: true } }),

        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCaret.configure({
          provider: provider,
          user: {
            name: user?.name || "Anonymous",
            color: stringToColor(user?.name || "Anonymous"),
            avatar: user?.avatar,
            id: user?._id,
          },
        }),
      ],
    },
    [ydoc, provider],
  ); // 依赖项变化时重建编辑器

  useEffect(() => {
    if (editor) {
      setEditor(editor);
    }
    if (provider) {
      setProvider(provider);
    }
    return () => {
      // 组件卸载时清理，防止 Toolbar 操作已销毁的实例
      setEditor(null);
      setProvider(null);
    };
  }, [editor, provider, setEditor, setProvider]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
});

export default TiptapEditor;
