import { Database } from "@hocuspocus/extension-database";
import { Hocuspocus } from "@hocuspocus/server";
import jwt from "jsonwebtoken";

import Doc from "../models/Document";
import DocState from "../models/DocumentState";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const hocuspocusServer = new Hocuspocus({
  timeout: 4000, // 连接超时
  debounce: 2000, // 核心配置：防抖 2 秒后才触发 onStoreDocument，减少数据库压力
  maxDebounce: 10000, // 最长 10 秒强制存一次

  extensions: [
    new Database({
      // 1. 加载文档：从 MongoDB 的 DocumentState 表读取二进制 Buffer
      fetch: async ({ documentName }) => {
        // documentName 这里约定就是 doc_id
        const docState = await DocState.findOne({ doc_id: documentName });

        if (docState && docState.state) {
          return docState.state; // 返回 Buffer
        }
        return null; // 如果是新文档，返回 null，Hocuspocus 会自动初始化
      },

      // 2. 保存文档：将 Y.js 的合并状态存回 MongoDB
      store: async ({ documentName, state }) => {
        // 使用 upsert (更新或插入)
        await DocState.findOneAndUpdate(
          { doc_id: documentName },
          {
            doc_id: documentName,
            state: state, // 直接存 Buffer
          },
          { upsert: true, new: true },
        );

        console.log(`[Hocuspocus] Saved doc ${documentName}`);
      },
    }),
  ],

  // 3. 鉴权：决定用户能否连接
  async onAuthenticate(data) {
    const { token } = data;
    console.log("[Hocuspocus] Authenticating...");

    // 3.1 校验 Token
    if (!token) {
      console.error("[Hocuspocus] No token provided");
      throw new Error("Not authorized: No token provided");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;
      // 3.2 校验文档权限
      const docId = data.documentName;

      const doc = await Doc.findById(docId);

      if (!doc) throw new Error("Document not found");

      const isOwner = doc.owner_id.toString() === userId;
      const isCollaborator = doc.collaborators.some((c) => c.user_id.toString() === userId);

      if (!isOwner && !isCollaborator) {
        throw new Error("Forbidden: You do not have access to this document");
      }

      // 3.3 获取用户信息
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      // 3.4 将用户信息注入上下文，供后续步骤（如光标显示）使用
      return {
        user: {
          id: userId,
          name: user.name,
          avatar: user.avatar,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16), // 随机颜色，或者从用户配置取
        },
      };
    } catch (err) {
      console.error("Auth failed:", err);
      throw new Error("Not authorized");
    }
  },
});
