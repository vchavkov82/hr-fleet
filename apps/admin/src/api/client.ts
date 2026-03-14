import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/api";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api/v1";

/** Placeholder — actual auth store wired in plan 02 */
function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      // TODO: attempt token refresh, redirect to login
      localStorage.removeItem("access_token");
    }
    return response;
  },
};

const client = createClient<paths>({ baseUrl });
client.use(authMiddleware);

export default client;
