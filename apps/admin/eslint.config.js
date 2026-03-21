import reactConfig from "@hr/eslint-config/react";

export default [
  ...reactConfig,
  { ignores: ["dist/**"] },
];
