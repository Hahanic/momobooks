import { memo } from "react";

import { Anchor, type AnchorProps } from "antd";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useAnchorItems } from "../../hooks/useAnchorItems";
import { useLayoutStore } from "../../store/layoutStore";

const AnchorList = memo(({ items }: { items: AnchorProps["items"] }) => {
  return (
    <Anchor
      className="border-l border-neutral-200 bg-white/60 pr-2 backdrop-blur-md"
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
    <>
      <div
        className="mb-2 flex size-6 cursor-pointer items-center justify-center rounded-md bg-white hover:bg-neutral-200"
        onClick={toggleAnchorVisibility}
      >
        {isAnchorVisible ? (
          <PanelLeftClose className="size-4 text-neutral-500" />
        ) : (
          <PanelLeftOpen className="size-4 text-neutral-500" />
        )}
      </div>
      <div className={`overflow-hidden ${isAnchorVisible ? "opacity-100" : "h-0 w-0 opacity-0"}`}>
        <div className="overflow-y-auto">
          <div className="size-full pr-6">
            <AnchorList items={items} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentAnchor;
