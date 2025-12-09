import { baseConfig } from "@momobooks/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
