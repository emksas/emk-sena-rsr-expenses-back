import test from "node:test";
import assert from "node:assert/strict";

process.env.MSAL_CACHE_ENC_KEY =
  process.env.MSAL_CACHE_ENC_KEY ||
  "1111111111111111111111111111111111111111111111111111111111111111";

const { decrypt, encrypt } = await import("../src/security/crypto.js");

test("encrypt and decrypt round trip plaintext", () => {
  const encrypted = encrypt("cache payload");

  assert.notEqual(encrypted, "cache payload");
  assert.equal(decrypt(encrypted), "cache payload");
});

test("encrypt uses a random IV", () => {
  const first = encrypt("same payload");
  const second = encrypt("same payload");

  assert.notEqual(first, second);
  assert.equal(decrypt(first), "same payload");
  assert.equal(decrypt(second), "same payload");
});
