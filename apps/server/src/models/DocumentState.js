// 这是 Hocuspocus (后端 WebSocket 服务) 真正读写的地方。
// 设计原理： Y.js 的数据是二进制流 (Uint8Array)。我们直接将合并后的最终状态存储为 Buffer。每次用户编辑停止 2 秒后（防抖），Hocuspocus 会调用 onStoreDocument 钩子，我们将内存中的 Y.Doc 转为 Buffer 存入此表。
import mongoose, { Schema } from "mongoose";

const DocumentStateSchema = new Schema(
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

const DocState = mongoose.model("DocumentState", DocumentStateSchema);

export default DocState;
