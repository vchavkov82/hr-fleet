import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from "./index.js";

const compat = new FlatCompat();

export default [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
