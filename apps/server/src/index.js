import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressWebsockets from "express-ws";

import { connectDB } from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/document.js";
import { hocuspocusServer } from "./websocket/hocuspocus.js";

dotenv.config();

const { app } = expressWebsockets(express());
const PORT = process.env.PORT;

// 中间件
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);

// 错误处理中间件
app.use(errorHandler);

// 处理 WebSocket 连接
// 客户端连接地址示例: ws://localhost:3000/collaboration
// express-ws 提供的 websocket 实例，Server 类实例通过 .hocuspocus 访问核心逻辑
app.ws("/collaboration", (websocket, request) => {
  hocuspocusServer.hocuspocus.handleConnection(websocket, request);
});

// 启动 Express 服务器
app.listen(PORT, () => {
  connectDB();
  console.log(`Express server listening on port ${PORT}`);
});
