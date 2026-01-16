import jwt from "jsonwebtoken";

import { sendResponse } from "../utils/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, "未授权：请先登录");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return sendResponse(res, 401, "未授权：Token 无效或已过期");
  }
};
