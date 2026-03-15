import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5080";
const TEST_EMAIL = __ENV.TEST_EMAIL || "admin@hr.localhost";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "testpass123";

export const options = {
  stages: [
    { duration: "30s", target: 30 },
    { duration: "1m", target: 167 }, // ~10k/min
    { duration: "30s", target: 167 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: [
      "p(50)<100",
      "p(95)<500",
      "p(99)<2000",
    ],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, {
    "login responded": (r) => r.status === 200 || r.status === 401,
  });

  let token = "";
  if (loginRes.status === 200) {
    try {
      token = loginRes.json("token") || loginRes.json("access_token") || "";
    } catch (_) {
      // response may not be JSON
    }
  }

  // Authenticated request
  if (token) {
    const empRes = http.get(`${BASE_URL}/api/v1/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    check(empRes, {
      "authenticated request ok": (r) => r.status === 200,
    });

    const meRes = http.get(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    check(meRes, {
      "me endpoint ok": (r) => r.status === 200,
    });
  }

  sleep(0.5);
}
