// 这是 Hocuspocus (后端 WebSocket 服务) 真正读写的地方。
// 设计原理： Y.js 的数据是二进制流 (Uint8Array)。每次用户编辑停止 2 秒后（防抖），Hocuspocus 会调用 onStoreDocument 钩子，将内存中的 Y.Doc 转为 Buffer 存入此表。
// doc_id：对应 houcspocus 的 documentName
// 格式 "ROOT_DOC_ID" (根文档) 或 "ROOT_DOC_ID::SUB_DOC_ID" (子文档)
import mongoose, { Schema } from "mongoose";

const DocumentStateSchema = new Schema(
  {
    doc_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    state: { type: Buffer, required: true },
  },
  { timestamps: true },
);

const DocState = mongoose.model("DocumentState", DocumentStateSchema);

export default DocState;
