import test, { mock } from "node:test";
import assert from "node:assert/strict";

import pool from "../src/config/db.js";
import {
  createUserInformation,
  getUserById,
  getUserByIdAndHomeAccountId,
} from "../src/services/UserService.js";

test.afterEach(() => {
  mock.restoreAll();
});

test("createUserInformation inserts Microsoft account session data", async () => {
  const dbResult = { rowCount: 1 };
  const user = {
    user_id: 42,
    home_account_id: "home-account",
    username: "user@example.com",
    tenant_id: "tenant",
    cache_encrypted: "encrypted-cache",
  };

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.match(query, /INSERT INTO public\.user_information/);
    assert.deepEqual(bindings, [
      42,
      "home-account",
      "user@example.com",
      "tenant",
      "encrypted-cache",
    ]);
    callback(null, dbResult);
  });

  const result = await createUserInformation(user);

  assert.equal(result, dbResult);
});

test("getUserById parses user id and returns rows", async () => {
  const rows = [{ user_id: 42, username: "user@example.com" }];

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.equal(query, "SELECT * FROM public.user_information WHERE user_id = $1;");
    assert.deepEqual(bindings, [42]);
    callback(null, { rows });
  });

  const result = await getUserById("42");

  assert.deepEqual(result, rows);
});

test("getUserByIdAndHomeAccountId queries by internal id and home account id", async () => {
  const row = { id: 9, home_account_id: "home-account" };

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.equal(
      query,
      "SELECT * FROM public.user_information WHERE id = $1 and home_account_id = $2;",
    );
    assert.deepEqual(bindings, [9, "home-account"]);
    callback(null, [row]);
  });

  const result = await getUserByIdAndHomeAccountId(9, "home-account");

  assert.equal(result, row);
});

test("getUserById rejects database errors", async () => {
  mock.method(pool, "query", (_query, _bindings, callback) => {
    callback(new Error("query failed"));
  });

  await assert.rejects(() => getUserById(42), /query failed/);
});
