import express from "express";

import { login, recordVisit, register, searchUsers } from "../controller/auth.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 注册
router.post("/register", register);
// 登录
router.post("/login", login);
// 记录最近访问文档
router.post("/recent", authMiddleware, recordVisit);
// 搜索用户
router.get("/search", authMiddleware, searchUsers);

export default router;
