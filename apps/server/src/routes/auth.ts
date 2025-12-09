import express from "express";

import { login, recordVisit, register } from "../controller/auth";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// 注册
router.post("/register", register);
// 登录
router.post("/login", login);
// 记录最近访问文档
router.post("/recent", authMiddleware, recordVisit);

export default router;
