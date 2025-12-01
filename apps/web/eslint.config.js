import { reactConfig } from "@momobooks/eslint-config/react";

export default [
  ...reactConfig,
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
