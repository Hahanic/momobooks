import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Layout, Spin } from "antd";

import Navbar from "../../components/layout/Navbar";
import Editor from "../../editor";
import { useDocument } from "../../hooks/useDocument";
import DocumentAnchor from "./anchor";
import DocumentNotFound from "./documentNotFound";
import DocumentNavbar from "./navbar";
import Toolbar from "./toolbar";

const DocumentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { document, loading, error } = useDocument();
  // 大纲
  const leftSidebar = useMemo(() => <DocumentAnchor />, []);
  // 批注
  const rightSidebar = useMemo(() => <div className="size-6 bg-amber-400" />, []);

  const editorNode = useMemo(() => <Editor documentId={id!} />, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Spin size="large" tip="正在加载文档..." />
      </div>
    );
  }

  if (error || !document || !id) {
    return <DocumentNotFound />;
  }

  return (
    <div className="flex size-full flex-col print:block print:h-auto">
      {/* 顶部导航区域 */}
      <div className="sticky top-0 z-10 h-auto w-full shrink-0 border-b border-neutral-200 bg-white px-3 print:hidden">
        <Navbar>
          <DocumentNavbar title={document.title} documentId={id} loading={loading} />
        </Navbar>
        <Toolbar />
      </div>

      <DocumentCanvas leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        {editorNode}
      </DocumentCanvas>
    </div>
  );
};

export default DocumentPage;

interface DocumentCanvasProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
}

const DocumentCanvas = memo(({ leftSidebar, rightSidebar, children }: DocumentCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [margins, setMargins] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateMargins = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const left = leftRef.current?.offsetWidth || 0;
      const right = rightRef.current?.offsetWidth || 0;

      let newLeft = left;
      let newRight = right;

      // 如果屏幕太窄，取消边距，让编辑器居中或占满
      if (containerWidth - left - right <= 320) {
        newLeft = 24;
        newRight = 24;
      }

      // 性能优化：值比较，防止不必要的重渲染
      setMargins((prev) => {
        if (prev.left === newLeft && prev.right === newRight) {
          return prev;
        }
        return { left: newLeft, right: newRight };
      });
    };

    // 初始化
    // updateMargins();

    const observer = new ResizeObserver(updateMargins);
    if (containerRef.current) observer.observe(containerRef.current);
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full overflow-hidden print:h-auto">
      {/* 左侧边栏容器 */}
      <div ref={leftRef} className="absolute left-2 z-5 h-full max-w-80 print:hidden">
        {leftSidebar}
      </div>
      <Layout
        id="document-scroll-container"
        className="relative h-full overflow-x-hidden overflow-y-auto bg-neutral-50 print:h-auto print:overflow-visible print:bg-white"
      >
        <div ref={containerRef} className="flex size-full print:block print:h-auto">
          {/* 中间编辑器容器 */}
          <div
            className="flex-1 print:m-0! print:w-full"
            style={{ marginLeft: margins.left, marginRight: margins.right }}
          >
            <div className="mx-auto max-w-205 print:max-w-full">{children}</div>
          </div>
        </div>
      </Layout>
      {/* 右侧边栏容器 */}
      <div ref={rightRef} className="absolute top-4 right-4 z-5 print:hidden">
        {rightSidebar}
      </div>
    </div>
  );
});
