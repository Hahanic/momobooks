import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
// import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, LineHeight, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useEditorStore } from "../store/editorStore";
import CustomHeading from "./extensions/heading";

const Editor = () => {
  const { setEditor } = useEditorStore();

  const editor = useEditor({
    onCreate: ({ editor }) => {
      setEditor(editor);
    },
    onDestroy: () => {
      setEditor(null);
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none print:border-0 max-w-205 bg-white min-h-[1054px] flex flex-col text-4 px-4 py-6",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      CustomHeading,
      TextStyle,
      FontFamily,
      FontSize,
      LineHeight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      // Link.configure({
      //   openOnClick: true,
      //   linkOnPaste: true,
      //   autolink: true,
      // }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        inline: true,
        resize: {
          enabled: true,
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TaskItem.configure({ nested: true }),
      TaskList,
      TableKit.configure({
        table: { resizable: true },
      }),
    ],
    content: ``,
    immediatelyRender: false,
  });

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
