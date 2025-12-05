import { memo } from "react";

import { Anchor, type AnchorProps } from "antd";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useAnchorItems } from "../../hooks/useAnchorItems";
import { useLayoutStore } from "../../store/layoutStore";

const AnchorList = memo(({ items }: { items: AnchorProps["items"] }) => {
  return (
    <Anchor
      getContainer={() => document.getElementById("document-scroll-container")!}
      affix={false}
      replace
      items={items}
    />
  );
});

const DocumentAnchor = () => {
  const items = useAnchorItems();
  const { isAnchorVisible, toggleAnchorVisibility } = useLayoutStore();
  if (items.length === 0) return null;
  return (
    <div className="flex size-full flex-col">
      <div
        className="flex size-6 cursor-pointer items-center justify-center rounded-md bg-white hover:bg-neutral-200"
        onClick={toggleAnchorVisibility}
      >
        {isAnchorVisible ? (
          <PanelLeftClose className="size-4 text-neutral-500" />
        ) : (
          <PanelLeftOpen className="size-4 text-neutral-500" />
        )}
      </div>
      <div
        className={`custom-scrollbar mt-4 flex-1 overflow-y-auto bg-white/60 backdrop-blur-md ${isAnchorVisible ? "opacity-100" : "h-0 w-0 opacity-0"}`}
      >
        <AnchorList items={items} />
      </div>
    </div>
  );
};

export default DocumentAnchor;
