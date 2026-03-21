import { createNextjsEslintConfig } from "eslint-config-next/flat.js";
import baseConfig from "./index.js";

export default [
  ...baseConfig,
  ...createNextjsEslintConfig(),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
