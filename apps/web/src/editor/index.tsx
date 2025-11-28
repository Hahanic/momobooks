import { Loading3QuartersOutlined } from "@ant-design/icons";

import useCollaboration from "../hooks/useCollaboration";
import { useUserStore } from "../store/userStore";
import TiptapEditor from "./tiptapEditor";

// 引入上面的子组件

interface EditorProps {
  documentId: string;
}

const EditorWrapper = ({ documentId }: EditorProps) => {
  const { user } = useUserStore();
  const collab = useCollaboration(documentId);

  if (!collab) {
    return (
      <div className="text-md flex h-full items-center justify-center gap-2 pt-20">
        <Loading3QuartersOutlined className="animate-spin text-neutral-500" />
        <p>Loading Collaborative Editor...</p>
      </div>
    );
  }

  return <TiptapEditor ydoc={collab.ydoc!} provider={collab.provider} user={user} />;
};

export default EditorWrapper;
