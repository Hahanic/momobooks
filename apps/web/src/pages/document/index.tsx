import { useEffect, useRef, useState } from "react";

import { Layout } from "antd";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Editor from "../../editor";
import { useAnchorItems } from "../../hooks/useAnchorItems";
import { useLayoutStore } from "../../store/layoutStore";
import DocumentAnchor from "./anchor";
import DocumentNavbar from "./navbar";
import Toolbar from "./toolbar";

const DocumentPage = () => {
  const { isAnchorVisible, toggleAnchorVisibility } = useLayoutStore();
  const items = useAnchorItems();
  const hasItems = items.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [margins, setMargins] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateMargins = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const left = leftRef.current?.offsetWidth || 0;
      const right = rightRef.current?.offsetWidth || 0;

      if (containerWidth - left - right <= 320) {
        setMargins({ left: 0, right: 0 });
      } else {
        setMargins({ left, right });
      }
    };

    // 初始化计算
    updateMargins();

    // 监听容器及左右侧边栏尺寸变化
    const observer = new ResizeObserver(updateMargins);
    if (containerRef.current) observer.observe(containerRef.current);
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex size-full flex-col print:block print:h-auto">
      <div className="sticky top-0 z-10 h-auto min-h-12 w-full shrink-0 border-b border-neutral-200 bg-white px-3 print:hidden">
        <Navbar>
          <DocumentNavbar />
        </Navbar>
        <Toolbar />
      </div>
      <Layout
        id="document-scroll-container"
        className="relative flex-1 overflow-auto bg-neutral-50 print:h-auto print:overflow-visible print:bg-white"
      >
        <div ref={containerRef} className="flex size-full print:block print:h-auto">
          <div ref={leftRef} className={`fixed top-24 z-5 max-w-80 sm:top-30 print:hidden`}>
            {hasItems && (
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
                <div
                  className={`overflow-hidden ${isAnchorVisible ? "opacity-100" : "w-0 opacity-0"}`}
                >
                  <DocumentAnchor items={items} />
                </div>
              </>
            )}
          </div>

          <div
            className="flex-1 print:m-0! print:w-full"
            style={{ marginLeft: margins.left, marginRight: margins.right }}
          >
            <div className="mx-auto max-w-205 print:max-w-full">
              <Editor />
            </div>
          </div>

          <div
            ref={rightRef}
            className="fixed top-24 right-0 z-5 size-5 bg-amber-400 sm:top-30 print:hidden"
          ></div>
        </div>
      </Layout>
    </div>
  );
};

export default DocumentPage;
