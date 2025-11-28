import express from "express";

import { login, register } from "../controller/auth";

const router = express.Router();

// 注册
router.post("/register", register);
// 登录
router.post("/login", login);

export default router;
