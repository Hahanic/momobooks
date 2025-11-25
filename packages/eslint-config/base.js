import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Base configuration for all projects (Node.js, Shared, etc.)
 */
export const baseConfig = [
  js.configs.recommended, // ESLint 推荐规则
  ...tseslint.configs.recommended, // TypeScript 推荐规则
  eslintConfigPrettier, // Prettier 兼容配置
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.config.js"],
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["dist", "node_modules", "coverage", ".turbo", ".next", "build"],
  },
];
