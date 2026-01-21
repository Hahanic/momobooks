import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true }),
    // Gzip 压缩
    viteCompression({
      verbose: true, // 是否在控制台输出压缩结果
      disable: false, // 是否禁用
      threshold: 10240, // 文件大小大于 10kb 才进行压缩
      algorithm: "gzip", // 压缩算法
      ext: ".gz", // 文件扩展名
      deleteOriginFile: false, // 是否删除源文件
    }),

    // Brotli 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "brotliCompress",
      ext: ".br",
      deleteOriginFile: false,
    }),
  ],
  server: {
    host: true, // 允许局域网访问 (相当于 0.0.0.0)
    port: 5173, // 固定端口
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",

        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. React 核心
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) {
              return "react-vendor";
            }

            // 2. 编辑器核心 (Tiptap 及其相关)
            if (/[\\/]node_modules[\\/](@tiptap|prosemirror)[\\/]/.test(id)) {
              return "editor-core";
            }

            // 3. UI 框架核心 (合并 AntD, Icons, Lucide)
            if (
              /[\\/]node_modules[\\/](antd|@ant-design|rc-.*|@rc-component|lucide-react)[\\/]/.test(
                id,
              )
            ) {
              return "ui-lib";
            }

            // 4. 协作与工具
            if (/[\\/]node_modules[\\/](yjs|y-|lib0|@hocuspocus)[\\/]/.test(id)) {
              return "collab-engine";
            }

            // 5. 其他剩余依赖
            return "vendor";
          }
        },
      },
    },
  },
});
