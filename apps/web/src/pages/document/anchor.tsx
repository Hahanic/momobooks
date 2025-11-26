import { Anchor } from "antd";

import { type AnchorItem } from "../../hooks/useAnchorItems";

interface DocumentAnchorProps {
  items: AnchorItem[];
}

const DocumentAnchor = ({ items }: DocumentAnchorProps) => {
  if (items.length === 0) return null;

  return (
    <div className="overflow-y-auto">
      <div className="size-full pr-6">
        <Anchor
          className="border-l border-neutral-200 bg-white/60 pr-2 backdrop-blur-md"
          getContainer={() => document.getElementById("document-scroll-container")!}
          affix={false}
          replace
          items={items}
        />
      </div>
    </div>
  );
};

export default DocumentAnchor;
