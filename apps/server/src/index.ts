import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressWebsockets from "express-ws";

import { connectDB } from "./config/db";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import documentRoutes from "./routes/document";
import { hocuspocusServer } from "./websocket/hocuspocus";

dotenv.config();

const { app } = expressWebsockets(express());
const PORT = process.env.PORT;

// 中间件
app.use(
  cors({
    // 必须指定具体的前端域名，不能用 '*'
    // 建议从环境变量读取，开发环境默认 localhost:5173
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // 允许携带 Cookie 或认证头
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
app.ws("/collaboration", (websocket, request) => {
  hocuspocusServer.handleConnection(websocket, request);
});

// Start Express Server
app.listen(PORT, () => {
  connectDB();
  console.log(`Express server listening on port ${PORT}`);
});
