import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import { sendResponse } from "../utils";

const JWT_SECRET = process.env.JWT_SECRET;

// 用户登录
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, "请提供邮箱和密码");
  }

  const user = await User.findOne({ email }).select("+password");
  let isPasswordCorrect = false;
  if (user) {
    isPasswordCorrect = await bcrypt.compare(password, user.password);
  }
  if (!isPasswordCorrect || !user) {
    return sendResponse(res, 401, "账户或密码错误");
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET!, {
    expiresIn: "7d",
  });

  const userToReturn = user.toObject();
  // @ts-expect-error password is required in schema but we want to remove it from response
  delete userToReturn.password;

  sendResponse(res, 200, "登录成功", { ...userToReturn, token });
};

// 注册新用户
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, "请提供邮箱和密码");
  }

  // 检查是否已注册
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(res, 409, "当前邮箱已被注册");
  }

  // 创建新用户，密码加密存储
  const username = email;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({
    name: username,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET!, {
    expiresIn: "7d",
  });

  const userToReturn = newUser.toObject();
  // @ts-expect-error password is required in schema but we want to remove it from response
  delete userToReturn.password;

  sendResponse(res, 201, "注册成功", { ...userToReturn, token });
};

// 记录用户访问的文档
export const recordVisit = async (req: AuthRequest, res: Response) => {
  const { documentId } = req.body;
  const userId = req.user?.userId;

  await User.findByIdAndUpdate(userId, {
    $pull: { recent_documents: { document: documentId } },
  });

  await User.findByIdAndUpdate(userId, {
    $push: {
      recent_documents: {
        $each: [{ document: documentId, last_visited: new Date() }],
        $position: 0,
        $slice: 50,
      },
    },
  });

  return sendResponse(res, 200, "访问记录已更新");
};
