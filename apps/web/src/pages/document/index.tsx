import Navbar from "../../components/layout/Navbar";
import Editor from "../../editor";
import DocumentNavbar from "./navbar";
import Toolbar from "./toolbar";

const DocumentPage = () => {
  return (
    <div className="flex size-full flex-col overflow-y-auto">
      <Navbar>
        <DocumentNavbar />
      </Navbar>
      <div className="sticky top-16 z-10 flex h-auto min-h-12 w-full shrink-0 items-center border-b border-neutral-200 bg-[#F1F4F9] p-2 md:px-4">
        <Toolbar />
      </div>
      <div className="shrink-0 p-4">
        <Editor />
      </div>
    </div>
  );
};

export default DocumentPage;
