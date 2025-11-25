// 这张表决定了左侧侧边栏的结构、权限和基本信息。注意：这里不存文档内容！
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDocument extends Document {
  title: string;
  owner_id: Types.ObjectId;
  parent_id: Types.ObjectId | null; // null 表示根目录下文档
  icon?: string; // Emoji 或 URL
  cover_image?: string;
  is_public: boolean; // 是否开启 Web 分享
  status: "active" | "archived" | "trashed"; // 软删除机制

  // 协作者列表 (简单权限模型)
  collaborators: Array<{
    user_id: Types.ObjectId;
    role: "editor" | "viewer";
  }>;

  // 纯文本缓存 (用于搜索，不用于渲染编辑器)
  search_text?: string;
}

const DocumentSchema: Schema = new Schema(
  {
    title: { type: String, default: "Untitled" },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
      index: true,
    },

    icon: String,
    cover_image: String,

    is_public: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "archived", "trashed"],
      default: "active",
      index: true,
    },

    collaborators: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["editor", "viewer"], default: "viewer" },
      },
    ],

    search_text: { type: String, select: false }, // 默认不查，搜索时才用
  },
  { timestamps: true },
);

// 复合索引：加速 "查询某用户根目录下的活跃文档"
DocumentSchema.index({ owner_id: 1, parent_id: 1, status: 1 });

export const Doc = mongoose.model<IDocument>("Document", DocumentSchema);
