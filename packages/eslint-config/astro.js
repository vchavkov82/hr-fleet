import eslintPluginAstro from "eslint-plugin-astro";
import baseConfig from "./index.js";

export default [
  ...baseConfig,
  ...eslintPluginAstro.configs.recommended,
];
