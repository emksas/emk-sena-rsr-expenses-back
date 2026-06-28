import test from "node:test";
import assert from "node:assert/strict";

process.env.MS_CLIENT_ID = process.env.MS_CLIENT_ID || "test-client-id";
process.env.MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || "test-client-secret";
process.env.MSAL_CACHE_ENC_KEY =
  process.env.MSAL_CACHE_ENC_KEY ||
  "0000000000000000000000000000000000000000000000000000000000000000";

const { buildServerAuthRedirectUrl } = await import("../src/services/msAuthService.js");

function makeRequest(headers = {}, protocol = "http") {
  return {
    protocol,
    get(name) {
      return headers[name.toLowerCase()];
    },
  };
}

test("buildServerAuthRedirectUrl uses request host and protocol", () => {
  const req = makeRequest({ host: "localhost:3000" }, "http");

  assert.equal(
    buildServerAuthRedirectUrl(req),
    "http://localhost:3000/api/auth/redirect",
  );
});

test("buildServerAuthRedirectUrl respects proxy forwarding headers", () => {
  const req = makeRequest({
    host: "node:3000",
    "x-forwarded-host": "app.example.com",
    "x-forwarded-proto": "https",
  });

  assert.equal(
    buildServerAuthRedirectUrl(req),
    "https://app.example.com/api/auth/redirect",
  );
});
