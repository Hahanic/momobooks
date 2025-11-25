// 这是 Hocuspocus (后端 WebSocket 服务) 真正读写的地方。
// 设计原理： Y.js 的数据是二进制流 (Uint8Array)。我们直接将合并后的最终状态存储为 Buffer。每次用户编辑停止 2 秒后（防抖），Hocuspocus 会调用 onStoreDocument 钩子，我们将内存中的 Y.Doc 转为 Buffer 存入此表。
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDocumentState extends Document {
  doc_id: Types.ObjectId; // 关联 Document 表
  state: Buffer; // Y.js encodeStateAsUpdate 产生的二进制数据
  vector_clock?: Buffer; // 可选：用于高级同步优化
}

const DocumentStateSchema: Schema = new Schema(
  {
    doc_id: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      unique: true,
    },
    state: { type: Buffer, required: true }, // Binary Blob
  },
  { timestamps: true },
);

export const DocState = mongoose.model<IDocumentState>("DocumentState", DocumentStateSchema);
