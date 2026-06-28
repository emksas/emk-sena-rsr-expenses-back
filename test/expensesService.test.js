import test, { mock } from "node:test";
import assert from "node:assert/strict";

import pool from "../src/config/db.js";
import {
  add,
  getByUserId,
  getByUserIdAndDateRange,
} from "../src/services/ExpensesService.js";

test.afterEach(() => {
  mock.restoreAll();
});

test("getByUserId queries expenses by user id", async () => {
  const expectedResults = { rows: [{ id: 1 }] };

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.equal(query, 'SELECT * FROM egreso WHERE "userId" = $1');
    assert.deepEqual(bindings, [42]);
    callback(null, expectedResults);
  });

  const results = await getByUserId(42);

  assert.equal(results, expectedResults);
});

test("getByUserIdAndDateRange queries expenses in date range", async () => {
  const expectedResults = { rows: [{ id: 2 }] };

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.equal(
      query,
      'SELECT * FROM egreso WHERE "userId" = $1 AND transactiondate >= $2 AND transactiondate <= $3',
    );
    assert.deepEqual(bindings, [42, "2026-06-01", "2026-06-30"]);
    callback(null, expectedResults);
  });

  const results = await getByUserIdAndDateRange(
    42,
    "2026-06-01",
    "2026-06-30",
  );

  assert.equal(results, expectedResults);
});

test("add inserts a parsed expense and resolves insert id", async () => {
  const expense = {
    amount: 9600,
    description: "RappiCard - Resumen de transacción",
    state: "payed",
    transactionDate: "2026-06-27T07:42:36.000Z",
    paymentMethod: "*6434",
    authorizationCode: "341253",
    merchant: "Oxxo",
    userId: 42,
  };

  mock.method(pool, "query", (query, bindings, callback) => {
    assert.match(query, /INSERT INTO public\.egreso/);
    assert.deepEqual(bindings, [
      9600,
      "RappiCard - Resumen de transacción",
      "payed",
      "2026-06-27T07:42:36.000Z",
      "*6434",
      "341253",
      "Oxxo",
      42,
    ]);
    callback(null, { insertId: 123 });
  });

  const insertId = await add(expense);

  assert.equal(insertId, 123);
});

test("add rejects when the database returns an error", async () => {
  mock.method(pool, "query", (_query, _bindings, callback) => {
    callback(new Error("database down"));
  });

  await assert.rejects(
    () =>
      add({
        amount: 1,
        description: "test",
        state: "payed",
        transactionDate: "2026-06-27T07:42:36.000Z",
        paymentMethod: "*0000",
        authorizationCode: "1",
        merchant: "Store",
        userId: 42,
      }),
    /database down/,
  );
});
