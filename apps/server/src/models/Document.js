// 这张表决定了左侧侧边栏的结构、权限和基本信息。注意：这里不存文档内容！
import mongoose, { Schema } from "mongoose";

const DocumentSchema = new Schema(
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
    trashed_at: { type: Date }, // 软删除时间
  },
  { timestamps: true },
);

// 复合索引：加速 "查询某用户根目录下的活跃文档"
DocumentSchema.index({ owner_id: 1, parent_id: 1, status: 1 });
// TTL 索引：30天后自动删除 trashed_at 存在的文档
DocumentSchema.index({ trashed_at: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Doc = mongoose.model("Document", DocumentSchema);

export default Doc;
