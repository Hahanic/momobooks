import { Heading } from "@tiptap/extension-heading";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // 保留原有属性
      id: {
        default: () => `h-${Math.random().toString(36).slice(2, 9)}`,
        parseHTML: (element: HTMLElement) => element.getAttribute("id"),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.id) {
            return {};
          }
          return {
            id: attributes.id,
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("heading-id-handler"),
        appendTransaction: (transactions, _oldState, newState) => {
          // Check if the transaction changed the document
          if (!transactions.some((tr) => tr.docChanged)) {
            return;
          }

          const tr = newState.tr;
          let modified = false;
          const ids = new Set<string>();

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== this.name) {
              return false;
            }
            // console.log("Visiting node:", node.type.name, "at position:", this.name);
            const id = node.attrs.id;

            if (!id || ids.has(id)) {
              // 如果没有 ID 或者 ID 已存在（重复），则生成新 ID
              const newId = `h-${Math.random().toString(36).slice(2, 9)}`;
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id: newId,
              });
              ids.add(newId);
              modified = true;
            } else {
              ids.add(id);
            }
          });

          if (modified) {
            return tr;
          }
        },
      }),
    ];
  },
});

export default CustomHeading;
