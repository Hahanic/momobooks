import { Loading3QuartersOutlined } from "@ant-design/icons";

import useCollaboration from "../hooks/useCollaboration";
import { useUserStore } from "../store/userStore";
import TiptapEditor from "./tiptapEditor";

interface EditorProps {
  documentId: string;
  editable: boolean;
}

const Editor = ({ documentId, editable }: EditorProps) => {
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

  return (
    <TiptapEditor ydoc={collab.ydoc!} provider={collab.provider} user={user} editable={editable} />
  );
};

export default Editor;
