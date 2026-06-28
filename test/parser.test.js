import test from "node:test";
import assert from "node:assert/strict";

import { parseRappiCardText } from "../src/services/parser.js";

test("parseRappiCardText extracts a valid RappiCard transaction", () => {
  const result = parseRappiCardText(`
    Monto
    $9.600

    Metodo de pago
    *6434

    No. de autorizacion
    341253

    Comercio
    Oxxo

    Fecha de la transaccion
    27/06/2026 07:42:36
  `);

  assert.deepEqual(result, {
    amount: 9600,
    paymentMethod: "*6434",
    authorizationCode: "341253",
    merchant: "Oxxo",
    transactionDate: "2026-06-27T07:42:36.000Z",
  });
});

test("parseRappiCardText returns null fields when the email is not a transaction", () => {
  const result = parseRappiCardText("Llegó el extracto de tu RappiCard");

  assert.deepEqual(result, {
    amount: null,
    paymentMethod: null,
    authorizationCode: null,
    merchant: null,
    transactionDate: null,
  });
});
