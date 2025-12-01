# 项目根目录

```text
momobooks-monorepo/
├── .github/                   # CI/CD workflows copilot
├── .vscode/                   # VSCode 统一配置 (推荐插件、格式化规则)
├── apps/                      # 应用程序容器
│   ├── web/                   # 前端项目 (React 19 + Vite 7)
│   └── server/                # 后端项目 (Node.js + Hocuspocus)
├── packages/                  # 共享包
│   ├── eslint-config/         # eslint 共享配置
│   └── shared/                # 共享类型定义 (DTOs, Interfaces)
├── package.json               # Root dependencies, scripts (/pnpm)
├── pnpm-workspace.yaml        # Monorepo 工作区配置
└── README.md
```
