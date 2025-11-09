import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 50 }, // Stay at 50 users for 1 minute
    { duration: "30s", target: 100 }, // Ramp up to 100 users
    { duration: "2m", target: 100 }, // Stay at 100 users for 2 minutes
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95% of requests under 500ms, 99% under 1s
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    errors: ["rate<0.005"], // Custom error rate < 0.5%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5173";

export default function () {
  // Homepage Load Test
  group("Homepage", () => {
    const res = http.get(`${BASE_URL}/`);

    check(res, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "contains Taskcoda": (r) => r.body.includes("Taskcoda"),
    }) || errorRate.add(1);
  });

  sleep(1);

  // Pricing Page Load Test
  group("Pricing Page", () => {
    const res = http.get(`${BASE_URL}/pricing`);

    check(res, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "contains pricing plans": (r) =>
        r.body.includes("Free") && r.body.includes("Pro"),
    }) || errorRate.add(1);
  });

  sleep(1);

  // Contact Page Load Test
  group("Contact Page", () => {
    const res = http.get(`${BASE_URL}/contact`);

    check(res, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "contains contact form": (r) => r.body.includes("Contact Us"),
    }) || errorRate.add(1);
  });

  sleep(1);

  // Privacy Page Load Test
  group("Privacy Page", () => {
    const res = http.get(`${BASE_URL}/privacy`);

    check(res, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "contains privacy policy": (r) => r.body.includes("Privacy Policy"),
    }) || errorRate.add(1);
  });

  sleep(1);

  // Health Check Endpoint
  group("Health Check", () => {
    const res = http.get(`${BASE_URL}/health`);

    check(res, {
      "status is 200 or 503": (r) => r.status === 200 || r.status === 503,
      "response time < 200ms": (r) => r.timings.duration < 200,
      "has JSON response": (r) => r.headers["Content-Type"].includes("application/json"),
    }) || errorRate.add(1);

    if (res.status === 200) {
      const body = JSON.parse(res.body);
      check(body, {
        "status is healthy": (b) => b.status === "healthy",
        "has checks": (b) => b.checks !== undefined,
      }) || errorRate.add(1);
    }
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    "test-results/load-test-summary.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || "";
  const enableColors = options.enableColors !== false;

  let summary = `${indent}
===============================================
  Load Test Summary - Taskcoda (TechSci, Inc.)
===============================================

Test Duration: ${data.state.testRunDurationMs / 1000}s
VUs: ${data.metrics.vus.values.max}

HTTP Metrics:
-------------
  Request Duration:
    - p(50): ${data.metrics.http_req_duration.values["p(50)"].toFixed(2)}ms
    - p(95): ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms
    - p(99): ${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}ms

  Request Rate:
    - Total: ${data.metrics.http_reqs.values.count}
    - Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s

  Failed Requests: ${data.metrics.http_req_failed.values.rate.toFixed(4)} (${(
    data.metrics.http_req_failed.values.rate * 100
  ).toFixed(2)}%)

Thresholds:
-----------
`;

  for (const [name, threshold] of Object.entries(data.metrics)) {
    if (threshold.thresholds) {
      for (const [thresholdName, result] of Object.entries(threshold.thresholds)) {
        const status = result.ok ? "✓ PASS" : "✗ FAIL";
        summary += `${indent}  ${status}: ${name} ${thresholdName}\n`;
      }
    }
  }

  summary += `${indent}
===============================================
`;

  return summary;
}
