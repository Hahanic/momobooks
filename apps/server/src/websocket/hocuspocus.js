import { Database } from "@hocuspocus/extension-database";
import { Server } from "@hocuspocus/server";
import jwt from "jsonwebtoken";

import Doc from "../models/Document.js";
import DocState from "../models/DocumentState.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const hocuspocusServer = new Server({
  timeout: 4000, // 连接超时
  debounce: 2000, // 防抖 2 秒后触发 onStoreDocument
  maxDebounce: 10000, // 10 秒存一次数据库

  extensions: [
    new Database({
      // 加载文档
      fetch: async ({ documentName }) => {
        // documentName 就是 DocState 的 doc_id
        const docState = await DocState.findOne({ doc_id: documentName });

        if (docState && docState.state) {
          return docState.state;
        }
        return null; // 如果是新文档，Hocuspocus 会自动初始化
      },

      // 保存文档：将 Y.js 的合并状态存回 MongoDB
      store: async ({ documentName, state }) => {
        await DocState.findOneAndUpdate(
          { doc_id: documentName },
          {
            doc_id: documentName,
            state: state,
          },
          { upsert: true, new: true },
        );
      },
    }),
  ],

  // 鉴权：决定用户能否连接
  async onAuthenticate(data) {
    const { token, documentName } = data;

    const rootDocId = documentName.includes("::") ? documentName.split("::")[0] : documentName;

    console.log(`[Hocuspocus] Authenticating 📖 ${documentName}`);

    // 校验 Token
    if (!token) {
      throw new Error("Not authorized: No token provided");
    }

    // 校验文档权限
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const doc = await Doc.findById(rootDocId);

      if (!doc) {
        throw new Error("Document not found");
      }

      const isOwner = doc.owner_id.toString() === userId;
      const collaborator = doc.collaborators.find((c) => c.user_id.toString() === userId);
      const isPublic = doc.is_public;

      // console.log(
      //   `[Hocuspocus] User ${userId} access check: Owner=${isOwner}, Collab=${!!collaborator}, Public=${isPublic}`,
      // );

      // 如果不是拥有者，不是协作者，且文档不公开 -> 禁止访问
      if (!isOwner && !collaborator && !isPublic) {
        throw new Error("Forbidden: You do not have access to this document");
      }

      // 默认只读
      let canEdit = false;

      if (isOwner) {
        canEdit = true;
      } else if (collaborator && collaborator.role === "editor") {
        canEdit = true;
      }

      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      // 将用户信息注入上下文
      return {
        user: {
          id: user._id.toString(),
          name: user.name,
        },
        readOnly: !canEdit,
      };
    } catch (error) {
      console.error("[Hocuspocus] Authentication 🙀:", error.message);
      throw error;
    }
  },
});
