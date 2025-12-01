# 共享包
```text
packages/shared/
├── src/
│   ├── api-types.ts           # API 请求/响应接口定义
│   ├── socket-events.ts       # 自定义 WebSocket 事件名枚举
│   ├── roles.ts               # 权限枚举 (Owner, Editor, Viewer)
│   └── error-codes.ts         # 统一错误码
├── package.json
├── eslint.config.ts
└── tsconfig.json
```