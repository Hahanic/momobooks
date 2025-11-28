// 类型定义和共享逻辑
export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IDocumentResponse {
  collaborators: Array<{
    role: "editor" | "viewer";
    user_id: string;
  }>;
  createdAt: string;
  is_public: boolean;
  owner_id: string;
  parent_id: string | null;
  status: "active" | "archived" | "trashed";
  title: string;
  updatedAt: string;
  _id: string;
}
