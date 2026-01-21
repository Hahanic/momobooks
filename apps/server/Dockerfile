FROM node:22-alpine
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 拷贝整个仓库的 lockfile 和子项目的 package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/

# 安装依赖（利用 pnpm 过滤功能）
RUN pnpm install --filter @momobooks/server --prod

# 拷贝后端源代码
COPY apps/server ./apps/server

WORKDIR /app/apps/server
EXPOSE 3000
CMD ["pnpm", "start"]