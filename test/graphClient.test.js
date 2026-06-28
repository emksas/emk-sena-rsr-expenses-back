import test, { mock } from "node:test";
import assert from "node:assert/strict";

import axios from "axios";
import {
  GRAPH_BASE_URL,
  graphGet,
  graphPatch,
  graphPost,
} from "../src/services/graphClient.js";

test.afterEach(() => {
  mock.restoreAll();
});

test("GRAPH_BASE_URL points to Microsoft Graph v1", () => {
  assert.equal(GRAPH_BASE_URL, "https://graph.microsoft.com/v1.0");
});

test("graphGet adds bearer token and preserves custom headers", async () => {
  mock.method(axios, "get", async (url, config) => ({ data: { url, config } }));

  const response = await graphGet("https://graph.test/me", "token-123", {
    headers: { Prefer: 'outlook.body-content-type="text"' },
    params: { $top: 5 },
  });

  assert.equal(response.data.url, "https://graph.test/me");
  assert.deepEqual(response.data.config, {
    headers: {
      Authorization: "Bearer token-123",
      Prefer: 'outlook.body-content-type="text"',
    },
    params: { $top: 5 },
  });
});

test("graphPost forwards body and authorization header", async () => {
  mock.method(axios, "post", async (url, body, config) => ({
    data: { url, body, config },
  }));

  const response = await graphPost(
    "https://graph.test/$batch",
    "token-456",
    { requests: [] },
  );

  assert.equal(response.data.url, "https://graph.test/$batch");
  assert.deepEqual(response.data.body, { requests: [] });
  assert.equal(response.data.config.headers.Authorization, "Bearer token-456");
});

test("graphPatch forwards body and authorization header", async () => {
  mock.method(axios, "patch", async (url, body, config) => ({
    data: { url, body, config },
  }));

  const response = await graphPatch(
    "https://graph.test/me/messages/1",
    "token-789",
    { isRead: true },
  );

  assert.equal(response.data.url, "https://graph.test/me/messages/1");
  assert.deepEqual(response.data.body, { isRead: true });
  assert.equal(response.data.config.headers.Authorization, "Bearer token-789");
});
