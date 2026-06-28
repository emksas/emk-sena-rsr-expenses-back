import test, { mock } from "node:test";
import assert from "node:assert/strict";

import axios from "axios";
import pool from "../src/config/db.js";
import { getMessagesFromFolderPath } from "../src/services/mailService.js";

test("getMessagesFromFolderPath stores valid transactions and marks only saved messages as read", async () => {
  const graphGetCalls = [];
  const graphPostCalls = [];
  const graphPatchCalls = [];
  const dbInserts = [];

  mock.method(axios, "get", async (url, config = {}) => {
    graphGetCalls.push({ url, config });

    if (url.includes("/me/mailFolders?")) {
      return { data: { value: [{ id: "folder-root" }] } };
    }

    if (url.includes("/me/mailFolders/folder-root/childFolders?")) {
      return { data: { value: [{ id: "folder-rappi" }] } };
    }

    if (url.includes("/me/mailFolders/folder-rappi/messages")) {
      return {
        data: {
          value: [
            {
              id: "message-valid",
              subject: "RappiCard - Resumen de transacción",
              receivedDateTime: "2026-06-27T12:42:45Z",
              isRead: false,
              from: {
                emailAddress: {
                  name: "RappiCard",
                  address: "noreply@rappicard.co",
                },
              },
            },
            {
              id: "message-invalid",
              subject: "Llegó el extracto de tu RappiCard",
              receivedDateTime: "2026-06-27T18:43:13Z",
              isRead: false,
              from: {
                emailAddress: {
                  name: "RappiCard",
                  address: "noreply@rappicard.co",
                },
              },
            },
          ],
        },
      };
    }

    throw new Error(`Unexpected GET ${url}`);
  });

  mock.method(axios, "post", async (url, body, config = {}) => {
    graphPostCalls.push({ url, body, config });

    assert.equal(url, "https://graph.microsoft.com/v1.0/$batch");

    return {
      data: {
        responses: [
          {
            id: "1",
            status: 200,
            body: {
              body: {
                content: `
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
                `,
              },
            },
          },
          {
            id: "2",
            status: 200,
            body: {
              body: {
                content: "Llegó el extracto de tu RappiCard",
              },
            },
          },
        ],
      },
    };
  });

  mock.method(axios, "patch", async (url, body, config = {}) => {
    graphPatchCalls.push({ url, body, config });
    return { data: { id: "message-valid", isRead: true } };
  });

  mock.method(pool, "query", (query, bindings, callback) => {
    dbInserts.push({ query, bindings });
    callback(null, { insertId: 123 });
  });

  const messages = await getMessagesFromFolderPath(
    "/Finanzas/rappi",
    "test-token",
    (raw) => {
      if (raw.includes("Monto")) {
        return {
          amount: 9600,
          paymentMethod: "*6434",
          authorizationCode: "341253",
          merchant: "Oxxo",
          transactionDate: "2026-06-27T07:42:36.000Z",
        };
      }

      return {
        amount: null,
        paymentMethod: null,
        authorizationCode: null,
        merchant: null,
        transactionDate: null,
      };
    },
    42,
    { top: 5 },
  );

  assert.equal(graphGetCalls.length, 3);
  assert.equal(graphPostCalls.length, 1);
  assert.equal(dbInserts.length, 1);
  assert.equal(graphPatchCalls.length, 1);
  assert.equal(
    graphPatchCalls[0].url,
    "https://graph.microsoft.com/v1.0/me/messages/message-valid",
  );
  assert.deepEqual(graphPatchCalls[0].body, { isRead: true });
  assert.equal(messages[0].isRead, true);
  assert.equal(messages[1].isRead, false);
});
