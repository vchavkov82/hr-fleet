import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5080";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
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
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const healthRes = http.get(`${BASE_URL}/healthz`);
  check(healthRes, {
    "health status 200": (r) => r.status === 200,
  });

  const apiRes = http.get(`${BASE_URL}/api/v1/employees`, {
    headers: { "Content-Type": "application/json" },
  });
  check(apiRes, {
    "employees status ok": (r) => r.status === 200 || r.status === 401,
  });

  sleep(0.3);
}
