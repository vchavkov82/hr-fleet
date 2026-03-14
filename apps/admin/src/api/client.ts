import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/api";
import { useAuthStore } from "@/auth/store";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api/v1";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status === 401 && !request.headers.get("X-Retry")) {
      const refreshed = await useAuthStore.getState().refresh();
      if (refreshed) {
        const token = useAuthStore.getState().accessToken;
        const retryReq = new Request(request, {
          headers: new Headers(request.headers),
        });
        retryReq.headers.set("Authorization", `Bearer ${token}`);
        retryReq.headers.set("X-Retry", "1");
        return fetch(retryReq);
      }
    }
    return response;
  },
};

const client = createClient<paths>({ baseUrl });
client.use(authMiddleware);

export default client;
