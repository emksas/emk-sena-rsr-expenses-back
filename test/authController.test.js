import test from "node:test";
import assert from "node:assert/strict";

process.env.MS_CLIENT_ID = process.env.MS_CLIENT_ID || "test-client-id";
process.env.MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || "test-client-secret";
process.env.MSAL_CACHE_ENC_KEY =
  process.env.MSAL_CACHE_ENC_KEY ||
  "2222222222222222222222222222222222222222222222222222222222222222";

const { authBrowserCallback } = await import("../src/controllers/authController.js");

function makeResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

test("authBrowserCallback renders a success callback page", () => {
  const req = {
    query: {
      microsoft_auth: "success",
      user_id: "42",
      username: "user@example.com",
    },
  };
  const res = makeResponse();

  authBrowserCallback(req, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /Autenticacion completada/);
  assert.match(res.body, /MICROSOFT_AUTH_FINISHED/);
  assert.match(res.body, /user@example.com/);
});

test("authBrowserCallback renders an escaped error callback page", () => {
  const req = {
    query: {
      microsoft_auth: "error",
      message: '<script>alert("x")</script>',
    },
  };
  const res = makeResponse();

  authBrowserCallback(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body, /Error en autenticacion/);
  assert.match(res.body, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
});
