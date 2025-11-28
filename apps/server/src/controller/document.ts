import { Response } from "express";
import { isValidObjectId } from "mongoose";

import { AuthRequest } from "../middlewares/auth";
import Document from "../models/Document";
import User from "../models/User";
import { sendResponse } from "../utils";

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, parent_id } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendResponse(res, 401, "未授权");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "用户不存在");
    }

    const newDoc = new Document({
      title: title || "Untitled",
      owner_id: userId,
      parent_id: parent_id || null,
      collaborators: [],
      is_public: false,
      status: "active",
    });

    await newDoc.save();

    sendResponse(res, 201, "文档创建成功", newDoc);
  } catch (error) {
    console.error("Create document error:", error);
    sendResponse(res, 500, "创建文档失败");
  }
};

export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    console.log(672347235234632);
    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, "无效的文档 ID");
    }

    const doc = await Document.findById(id);

    if (!doc) {
      return sendResponse(res, 404, "文档不存在");
    }

    // 简单的权限检查
    const isOwner = doc.owner_id.toString() === userId;
    // const isCollaborator = doc.collaborators.some(c => c.user_id.toString() === userId);

    if (!isOwner && !doc.is_public) {
      return sendResponse(res, 403, "无权访问该文档");
    }

    sendResponse(res, 200, "获取成功", doc);
  } catch (error) {
    console.error("Get document error:", error);
    sendResponse(res, 500, "获取文档失败");
  }
};
