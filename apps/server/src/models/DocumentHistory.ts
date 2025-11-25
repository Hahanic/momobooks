// 用于“时光倒流”功能。
// 触发机制： 不需要每次按键都存。可以：
// 1. 每隔 10 分钟自动存一次（如果内容有变）。
// 2. 用户手动点击“保存版本”。
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDocumentHistory extends Document {
  doc_id: Types.ObjectId;
  state: Buffer; // 当时的 Y.js 状态快照
  snapshot_name?: string; // 用户自定义版本名，如 "初稿完成"
  created_by?: Types.ObjectId;
}

const DocumentHistorySchema: Schema = new Schema(
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

export const DocHistory = mongoose.model<IDocumentHistory>(
  "DocumentHistory",
  DocumentHistorySchema,
);
// ```

// ---

// ### 💡 架构师的设计备注 (必读)

// 1.  **为什么把 Metadata 和 State 分开存？**
//     * **场景**：当用户打开 Dashboard 时，需要拉取 100 个文档的标题生成树状菜单。
//     * **问题**：如果内容和标题在一张表，MongoDB 可能会把巨大的富文本内容（State）也加载进内存，导致 IO 爆炸。
//     * **解法**：分离后，生成菜单只查 `Document` 表（极小），点击文档进入编辑器时，再异步加载 `DocumentState` 表（较大）。

// 2.  **无限层级的处理策略**
//     * 我使用了最简单的 `parent_id` **邻接表模式**。
//     * *优点*：移动文档非常快（只要改一个 `parent_id` 就可以把整个子树拖拽到别的地方）。
//     * *缺点*：查询整棵树需要递归查询（Front-end 懒加载）或使用 MongoDB `$graphLookup` 聚合查询。对于 Notion 类应用，前端懒加载（点击展开再请求子节点）是性能最优解。

// 3.  **Hocuspocus 集成提示**
//     * 在后端配置 Hocuspocus 时，你的 Database Extension 伪代码逻辑如下：
//         ```javascript
//         async fetch(data) {
//            // 1. 从 DocumentState 表读取 Buffer
//            const doc = await DocState.findOne({ doc_id: data.documentName });
//            return doc ? doc.state : null;
//         }

//         async store(data) {
//            // 2. 将最新的 state Buffer 存入 DocumentState
//            await DocState.findOneAndUpdate(
//              { doc_id: data.documentName },
//              { state: data.state }, // Hocuspocus 传来的 Buffer
//              { upsert: true }
//            );

//            // 3. (可选) 异步提取纯文本存入 Document 表的 search_text 字段，便于搜索
//            // const text = Y.encodeStateAsUpdate(data.state)... // 转为文本
//         }
