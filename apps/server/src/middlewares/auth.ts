import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { sendResponse } from "../utils";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, "未授权：请先登录");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    return sendResponse(res, 401, "未授权：Token 无效或已过期");
  }
};
