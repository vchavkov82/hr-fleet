import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5012,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5080",
        changeOrigin: true,
      },
    },
  },
});
