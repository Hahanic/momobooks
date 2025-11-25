# 项目根目录
  momobooks-monorepo/
  ├── .github/                   # CI/CD workflows copilot
  ├── .vscode/                   # VSCode 统一配置 (推荐插件、格式化规则)
  ├── apps/                      # 应用程序容器
  │   ├── web/                   # 前端项目 (React 19 + Vite 7)
  │   └── server/                # 后端项目 (Node.js + Hocuspocus)
  ├── packages/                  # 共享包
  │   └── shared/                # 共享类型定义 (DTOs, Interfaces)
  ├── package.json               # Root dependencies, scripts (/pnpm)
  ├── pnpm-workspace.yaml        # Monorepo 工作区配置
  └── README.md

# 前端架构
  apps/web/
  ├── public/                    # 静态资源 (favicon, robots.txt)
  ├── src/
  │   ├── assets/                # 图片、字体、全局样式 (CSS)
  │   ├── components/            # UI 组件库
  │   │   ├── common/            # 通用原子组件 (基于 AntD 二次封装)
  │   │   │   ├── Button/
  │   │   │   ├── Avatar/
  │   │   │   └── Loading/
  │   │   ├── layout/            # 布局组件
  │   │   │   ├── Sidebar/       # 左侧文档树导航
  │   │   │   ├── Navbar/        # 顶部面包屑、在线用户头像
  │   │   │   └── AuthLayout/    # 登录页布局
  │   │   └── block-editor/      # [核心] 编辑器相关 UI (非核心逻辑)
  │   │       ├── SlashMenu/     # "/" 唤起的命令菜单
  │   │       ├── BubbleMenu/    # 选中文字后的浮动菜单
  │   │       ├── TableOfContent/# 目录大纲
  │   │       └── LinkPreview/   # 链接卡片预览
  │   ├── config/                # 全局配置 (Env, Constants)
  │   ├── hooks/                 # 自定义 React Hooks
  │   │   ├── useAuth.ts         # 用户认证状态
  │   │   ├── useBlockEditor.ts  # Tiptap 实例初始化逻辑
  │   │   └── useSidebar.ts      # 侧边栏折叠/展开
  │   ├── lib/                   # 第三方库配置/工具
  │   │   ├── api.ts             # Axios/Fetch 封装
  │   │   ├── yjs-provider.ts    # HocuspocusProvider 单例配置
  │   │   └── utils.ts           # 通用工具函数
  │   ├── pages/                 # 页面路由 (React Router)
  │   │   ├── auth/              # 登录/注册
  │   │   ├── dashboard/         # 个人工作台
  │   │   ├── document/          # 文档详情页 (编辑器入口)
  │   │   └── settings/          # 设置页
  │   ├── store/                 # 全局状态管理 (Zustand)
  │   │   ├── userStore.ts
  │   │   └── docTreeStore.ts    # 文档树结构缓存
  │   ├── editor/                # [核心] Tiptap 编辑器逻辑深度定制
  │   │   ├── extensions/        # 自定义 Tiptap 节点 (Node) 和 标记 (Mark)
  │   │   │   ├── ImageBlock/    # 图片块 (支持拖拽、Resize)
  │   │   │   ├── DragHandle/    # 块级拖拽手柄逻辑
  │   │   │   ├── SlashCommand/  # 斜杠命令逻辑
  │   │   │   └── AICopilot/     # AI 续写插件
  │   │   ├── props/             # 编辑器事件处理 (handleDrop, handlePaste)
  │   │   └── styles/            # 编辑器专用 CSS (ProseMirror 样式覆写)
  │   ├── types/                 # 前端专用类型 (Props, State)
  │   ├── App.tsx                # 根组件
  │   └── main.tsx               # 入口文件
  ├── vite.config.ts             # Vite 配置
  └── tsconfig.json

# 后端架构
  apps/server/
  ├── src/
  │   ├── config/                # 配置文件
  │   │   ├── db.ts              # MongoDB 连接
  │   │   └── env.ts             # 环境变量校验
  │   ├── controllers/           # HTTP 业务逻辑控制器
  │   │   ├── authController.ts
  │   │   ├── docController.ts   # 文档元数据 CRUD
  │   │   └── fileController.ts  # 图片上传处理 (S3/OSS)
  │   ├── middlewares/           # 中间件
  │   │   ├── auth.ts            # JWT 校验
  │   │   └── rateLimit.ts       # 限流
  │   ├── models/                # Mongoose Schema
  │   │   ├── User.ts
  │   │   └── Document.ts        # 文档元数据 (不含 Y.js 二进制数据)
  │   ├── routes/                # HTTP 路由定义
  │   │   ├── v1/
  │   │       ├── auth.routes.ts
  │   │       └── doc.routes.ts
  │   ├── services/              # 复杂业务逻辑封装
  │   │   ├── aiService.ts       # OpenAI/LLM 调用封装
  │   │   └── emailService.ts    # 发送邀请邮件
  │   ├── websocket/             # [核心] 实时协作服务
  │   │   ├── hocuspocus.ts      # Hocuspocus Server 实例
  │   │   ├── extensions/        # Hocuspocus 钩子
  │   │   │   ├── database.ts    # 持久化：定时将 Y.doc 写入 MongoDB
  │   │   │   └── auth.ts        # WS 握手鉴权
  │   │   └── utils/
  │   │       └── binaryUtils.ts # Y.js Update 编码/解码工具
  │   ├── index.ts               # 服务启动入口
  │   └── types.d.ts             # 后端类型补充
  ├── nodemon.json               # 开发热重载配置
  └── tsconfig.json

# 共享包
  packages/shared/
  ├── src/
  │   ├── api-types.ts           # API 请求/响应接口定义
  │   ├── socket-events.ts       # 自定义 WebSocket 事件名枚举
  │   ├── roles.ts               # 权限枚举 (Owner, Editor, Viewer)
  │   └── error-codes.ts         # 统一错误码
  ├── package.json
  └── tsconfig.json