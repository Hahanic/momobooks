import { Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";

import { AuthRequest } from "../middlewares/auth";
import Document from "../models/Document";
import User from "../models/User";
import { sendResponse } from "../utils";

// 创建新文档
export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, parent_id, is_public, collaborators } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendResponse(res, 401, "未授权");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "用户不存在");
    }

    if (parent_id) {
      const parentDoc = await Document.findById(parent_id);
      if (!parentDoc) {
        return sendResponse(res, 400, "父文档不存在");
      }
      if (parentDoc.owner_id.toString() !== userId) {
        return sendResponse(res, 403, "无权在该父文档下创建子文档");
      }
    }

    // 规范化协作者列表
    const validCollaborators = [];
    if (Array.isArray(collaborators)) {
      for (const c of collaborators) {
        if (c.user_id && isValidObjectId(c.user_id)) {
          validCollaborators.push({
            user_id: c.user_id,
            role: c.role || "editor",
          });
        }
      }
    }

    const newDoc = new Document({
      title: title || "Untitled",
      owner_id: userId,
      parent_id: parent_id || null,
      collaborators: validCollaborators,
      is_public: !!is_public,
      status: "active",
    });

    await newDoc.save();

    const docResponse = newDoc.toObject();
    // @ts-expect-error: __v exists in mongoose document but might not be in type
    delete docResponse.__v;

    // Add owner_info
    (docResponse as any).owner_info = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

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
      .populate("owner_id", "name email avatar")
      .sort({ updatedAt: -1 })
      .lean();

    const results = docs.map((doc) => ({
      ...doc,
      owner_id: (doc.owner_id as any)._id,
      owner_info: doc.owner_id,
    }));

    sendResponse(res, 200, "获取成功", results);
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

    const doc = await Document.findById(id)
      .select("-__v")
      .populate("owner_id", "name email avatar")
      .populate("collaborators.user_id", "name email avatar")
      .lean();

    if (!doc) {
      return sendResponse(res, 404, "文档不存在");
    }

    // 简单的权限检查
    const ownerIdStr = (doc.owner_id as any)._id.toString();
    const isOwner = ownerIdStr === userId;
    const isCollaborator = doc.collaborators.some(
      (c) => (c.user_id as any)._id.toString() === userId,
    );

    if (!isOwner && !isCollaborator && !doc.is_public) {
      return sendResponse(res, 403, "无权访问该文档");
    }

    if (doc.status === "trashed") {
      return sendResponse(res, 410, "文档已被删除");
    }

    const result = {
      ...doc,
      owner_id: ownerIdStr,
      owner_info: doc.owner_id,
      collaborators: doc.collaborators.map((c: any) => ({
        role: c.role,
        user_id: c.user_id._id,
        user_info: c.user_id,
      })),
    };

    sendResponse(res, 200, "获取成功", result);

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
        populate: {
          path: "owner_id",
          select: "name email avatar",
        },
      })
      .select("recent_documents")
      .lean();

    if (!user) {
      return sendResponse(res, 200, "获取成功", []);
    }

    const recentDocs = user.recent_documents as unknown as [];
    const uniqueMap = new Map();

    (recentDocs || []).forEach((item: any) => {
      if (item.document && item.document.status !== "trashed") {
        const docId = item.document._id.toString();
        if (!uniqueMap.has(docId)) {
          const docData = item.document;
          uniqueMap.set(docId, {
            ...docData,
            owner_id: docData.owner_id._id,
            owner_info: docData.owner_id,
            last_visited: item.last_visited,
          });
        }
      }
    });

    const list = Array.from(uniqueMap.values());

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
        populate: {
          path: "owner_id",
          select: "name email avatar",
        },
      })
      .select("starred_documents")
      .lean();

    if (!user) {
      return sendResponse(res, 200, "获取成功", []);
    }

    const starredDocs = (user.starred_documents || [])
      .filter((doc: any) => doc && doc.status !== "trashed")
      .map((doc: any) => ({
        ...doc,
        owner_id: doc.owner_id._id,
        owner_info: doc.owner_id,
      }));

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
      .populate("owner_id", "name email avatar")
      .sort({ updatedAt: -1 })
      .lean();

    const results = docs.map((doc) => ({
      ...doc,
      owner_id: (doc.owner_id as any)._id,
      owner_info: doc.owner_id,
    }));

    return sendResponse(res, 200, "获取成功", results);
  } catch (error) {
    console.error("Get shared documents error:", error);
    sendResponse(res, 500, "获取共享文档失败");
  }
};

// 获取回收站文档列表
export const getTrash = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const docs = await Document.find({
      owner_id: userId,
      status: "trashed",
    })
      .select("-__v")
      .populate("owner_id", "name email avatar")
      .sort({ trashed_at: -1 })
      .lean();

    const list = docs.map((doc: any) => {
      let daysRemaining = 30;
      if (doc.trashed_at) {
        const diffTime = Math.abs(new Date().getTime() - new Date(doc.trashed_at).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, 30 - diffDays);
      }
      return {
        ...doc,
        owner_id: doc.owner_id._id,
        owner_info: doc.owner_id,
        days_remaining: daysRemaining,
      };
    });

    return sendResponse(res, 200, "获取成功", list);
  } catch (error) {
    console.error("Get trash documents error:", error);
    sendResponse(res, 500, "获取回收站文档失败");
  }
};

// 重命名文档
export const renameDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.userId;
    console.log("Rename request:", { id, title, userId });
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

// 更新文档（通用更新，包括协作者和公开状态）
export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, is_public, collaborators } = req.body;
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

    if (title !== undefined) doc.title = title;
    if (is_public !== undefined) doc.is_public = !!is_public;

    if (collaborators !== undefined && Array.isArray(collaborators)) {
      const validCollaborators = [];
      for (const c of collaborators) {
        if (c.user_id && isValidObjectId(c.user_id)) {
          // 确保不能添加自己为协作者
          if (c.user_id.toString() !== userId) {
            validCollaborators.push({
              user_id: c.user_id,
              role: c.role || "editor",
            });
          }
        }
      }
      doc.collaborators = validCollaborators;
    }

    await doc.save();

    // Populate owner info for response consistency
    await doc.populate("owner_id", "name email avatar");
    const result = {
      ...doc.toObject(),
      owner_id: (doc.owner_id as any)._id,
      owner_info: doc.owner_id,
    };
    // @ts-expect-error: __v exists
    delete result.__v;

    sendResponse(res, 200, "更新成功", result);
  } catch (error) {
    console.error("Update document error:", error);
    sendResponse(res, 500, "更新文档失败");
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
    await Document.updateMany(
      { _id: { $in: targetIds } },
      { $set: { status: "trashed", trashed_at: new Date() } },
    );

    sendResponse(res, 200, "删除成功");
  } catch (error) {
    console.error("Delete document error:", error);
    sendResponse(res, 500, "删除文档失败");
  }
};

// 恢复文档
export const restoreDocument = async (req: AuthRequest, res: Response) => {
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
      return sendResponse(res, 403, "无权恢复该文档");
    }

    // 递归查找所有子文档
    const descendants = await Document.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $graphLookup: {
          from: "documents",
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

    // 批量恢复
    await Document.updateMany(
      { _id: { $in: targetIds } },
      { $set: { status: "active" }, $unset: { trashed_at: 1 } },
    );

    sendResponse(res, 200, "恢复成功");
  } catch (error) {
    console.error("Restore document error:", error);
    sendResponse(res, 500, "恢复文档失败");
  }
};

// 彻底删除文档
export const permanentDeleteDocument = async (req: AuthRequest, res: Response) => {
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
          from: "documents",
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

    // 批量彻底删除
    await Document.deleteMany({ _id: { $in: targetIds } });

    sendResponse(res, 200, "彻底删除成功");
  } catch (error) {
    console.error("Permanent delete document error:", error);
    sendResponse(res, 500, "彻底删除文档失败");
  }
};
