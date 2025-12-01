# 后端架构
```text
apps/server/
├── src/
│   ├── config/                # 配置文件
│   │   ├── db.ts              # MongoDB 连接
│   ├── controllers/           # HTTP 业务逻辑控制器
│   │   ├── authController.ts
│   │   ├── docController.ts   # 文档元数据 CRUD
│   │   └── fileController.ts  # 图片上传处理 (S3/OSS)
│   ├── middlewares/           # 中间件
│   │   ├── auth.ts            # JWT 校验
│   │   ├── errorHandler.ts    # 统一错误处理
│   │   └── rateLimit.ts       # 限流
│   ├── models/                # Mongoose Schema
│   │   ├── User.ts
│   │   └── Document.ts        # 文档元数据 (不含 Y.js 二进制数据)
│   ├── routes/                # HTTP 路由定义
│   │   ├── auth.ts
│   │   └── doc.ts
│   ├── services/              # 复杂业务逻辑封装
│   │   ├── aiService.ts       # OpenAI/LLM 调用封装
│   │   └── emailService.ts    # 发送邀请邮件
│   ├── websocket/             # [核心] 实时协作服务
│   │   ├── hocuspocus.ts      # Hocuspocus Server 实例
│   │   ├── extensions/        # Hocuspocus 钩子
│   │   │   ├── database.ts    # 持久化：定时将 Y.doc 写入 MongoDB
│   │   │   └── auth.ts        # WS 握手鉴权
│   │   └── utils/
            ├── index.ts       # 工具函数
│   │       └── binaryUtils.ts # Y.js Update 编码/解码工具
│   ├── index.ts               # 服务启动入口
│   └── types.d.ts             # 后端类型补充
├── nodemon.json               # 开发热重载配置
├── env.ts             # 环境变量校验
├── eslint.config.ts
└── tsconfig.json
  ```