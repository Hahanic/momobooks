import { type HocuspocusProvider } from "@hocuspocus/provider";
import { type Editor } from "@tiptap/react";
import { create } from "zustand";

interface EditorState {
  editor: Editor | null;
  provider: HocuspocusProvider | null;
  setEditor: (editor: Editor | null) => void;
  setProvider: (provider: HocuspocusProvider | null) => void;
}
export const useEditorStore = create<EditorState>((set) => ({
  editor: null,
  provider: null,
  setEditor: (editor) => set({ editor }),
  setProvider: (provider) => set({ provider }),
}));
