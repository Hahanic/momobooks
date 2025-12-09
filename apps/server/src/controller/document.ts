import { Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";

import { AuthRequest } from "../middlewares/auth";
import Document from "../models/Document";
import User from "../models/User";
import { sendResponse } from "../utils";

// 创建新文档
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

    const docResponse = newDoc.toObject();
    // @ts-expect-error: __v exists in mongoose document but might not be in type
    delete docResponse.__v;

    sendResponse(res, 201, "文档创建成功", docResponse);
  } catch (error) {
    console.error("Create document error:", error);
    sendResponse(res, 500, "创建文档失败");
  }
};

// 获取用户的所有文档列表
export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendResponse(res, 401, "未授权");
    }

    // 仅获取该用户创建的文档
    const docs = await Document.find({
      owner_id: userId,
      status: { $ne: "trashed" },
    })
      .select("-__v")
      .sort({ updatedAt: -1 })
      .lean();

    sendResponse(res, 200, "获取成功", docs);
  } catch (error) {
    console.error("Get documents error:", error);
    sendResponse(res, 500, "获取文档失败");
  }
};

// 获取单个文档信息
export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, "无效的文档 ID");
    }

    const doc = await Document.findById(id).select("-__v");

    if (!doc) {
      return sendResponse(res, 404, "文档不存在");
    }

    // 简单的权限检查
    const isOwner = doc.owner_id.toString() === userId;
    const isCollaborator = doc.collaborators.some((c) => c.user_id.toString() === userId);

    if (!isOwner && !isCollaborator && !doc.is_public) {
      return sendResponse(res, 403, "无权访问该文档");
    }

    if (doc.status === "trashed") {
      return sendResponse(res, 410, "文档已被删除");
    }

    sendResponse(res, 200, "获取成功", { ...doc.toObject() });

    // 更新用户的最近访问列表
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $pull: { recent_documents: { document: id } },
        });

        await User.findByIdAndUpdate(userId, {
          $push: {
            recent_documents: {
              $each: [{ document: id, last_visited: new Date() }],
              $position: 0,
              $slice: 20,
            },
          },
        });
      } catch (err) {
        console.error("Failed to update recent documents:", err);
      }
    }
  } catch (error) {
    console.error("Get document error:", error);
    sendResponse(res, 500, "获取文档失败");
  }
};

// 获取最近访问的文档列表
export const getRecent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId)
      .populate({
        path: "recent_documents.document",
        select: "-__v",
      })
      .select("recent_documents")
      .lean();

    if (!user) {
      return sendResponse(res, 200, "获取成功", []);
    }

    // 过滤掉可能已经被删除的文档，并展平结构
    const recentDocs = user.recent_documents as unknown as [];
    const list = (recentDocs || [])
      .filter((item: any) => item.document && item.document.status !== "trashed")
      .map((item: any) => ({
        ...item.document,
        last_visited: item.last_visited,
      }));

    return sendResponse(res, 200, "获取成功", list);
  } catch {
    sendResponse(res, 500, "获取最近文档失败");
  }
};

// 获取收藏的文档列表
export const getStarred = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId)
      .populate({
        path: "starred_documents",
        select: "-__v",
      })
      .select("starred_documents")
      .lean();

    if (!user) {
      return sendResponse(res, 200, "获取成功", []);
    }

    const starredDocs = (user.starred_documents || []).filter(
      (doc: any) => doc && doc.status !== "trashed",
    );

    return sendResponse(res, 200, "获取成功", starredDocs);
  } catch (error) {
    console.error("Get starred documents error:", error);
    sendResponse(res, 500, "获取收藏文档失败");
  }
};

// 获取与我共享的文档列表
export const getShared = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const docs = await Document.find({
      "collaborators.user_id": userId,
      status: { $ne: "trashed" },
    })
      .select("-__v")
      .sort({ updatedAt: -1 })
      .lean();

    return sendResponse(res, 200, "获取成功", docs);
  } catch (error) {
    console.error("Get shared documents error:", error);
    sendResponse(res, 500, "获取共享文档失败");
  }
};

// 重命名文档
export const renameDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, "无效的文档 ID");
    }

    const doc = await Document.findById(id);

    if (!doc) {
      return sendResponse(res, 404, "文档不存在");
    }

    if (doc.owner_id.toString() !== userId) {
      return sendResponse(res, 403, "无权修改该文档");
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return sendResponse(res, 400, "标题不能为空");
    }

    doc.title = title || doc.title;
    await doc.save();

    sendResponse(res, 200, "重命名成功", doc);
  } catch (error) {
    console.error("Rename document error:", error);
    sendResponse(res, 500, "重命名文档失败");
  }
};

// 收藏文档
export const starDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, "无效的文档 ID");
    }

    const user = await User.findById(userId).select("+starred_documents");

    if (!user) {
      return sendResponse(res, 404, "用户不存在");
    }

    // 检查是否已收藏
    const isStarred = user.starred_documents.some((docId) => docId.toString() === id);

    if (isStarred) {
      user.starred_documents = user.starred_documents.filter((docId) => docId.toString() !== id);
      await user.save();
      return sendResponse(res, 200, "文档已取消收藏", { isStarred: false });
    } else {
      user.starred_documents.push(id);
      await user.save();
      return sendResponse(res, 200, "收藏成功", { isStarred: true });
    }
  } catch (error) {
    console.error("Star document error:", error);
    sendResponse(res, 500, "收藏文档失败");
  }
};

// 删除文档（软删除）
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, "无效的文档 ID");
    }

    const doc = await Document.findById(id);

    if (!doc) {
      return sendResponse(res, 404, "文档不存在");
    }

    if (doc.owner_id.toString() !== userId) {
      return sendResponse(res, 403, "无权删除该文档");
    }

    // 递归查找所有子文档
    const descendants = await Document.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $graphLookup: {
          from: "documents", // 集合名称
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent_id",
          as: "children",
        },
      },
    ]);

    const targetIds = [id];
    if (descendants.length > 0 && descendants[0].children) {
      descendants[0].children.forEach((child: any) => {
        targetIds.push(child._id);
      });
    }

    // 批量软删除
    await Document.updateMany({ _id: { $in: targetIds } }, { $set: { status: "trashed" } });

    sendResponse(res, 200, "删除成功");
  } catch (error) {
    console.error("Delete document error:", error);
    sendResponse(res, 500, "删除文档失败");
  }
};
