// 用于“时光倒流”功能。
// 触发机制： 不需要每次按键都存。可以：
// 1. 每隔 10 分钟自动存一次（如果内容有变）。
// 2. 用户手动点击“保存版本”。
import mongoose, { Schema } from "mongoose";

const DocumentHistorySchema = new Schema(
  {
    doc_id: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    state: { type: Buffer, required: true },
    snapshot_name: String,
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
); // 历史记录一旦创建不可修改

const DocHistory = mongoose.model("DocumentHistory", DocumentHistorySchema);

export default DocHistory;
