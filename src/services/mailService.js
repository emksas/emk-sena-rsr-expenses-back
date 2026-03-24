import { addExpense } from "./ExpensesService.js";
import { GRAPH_BASE_URL, graphGet, graphPost } from "./graphClient.js";

const esc = (s) => s.replace(/'/g, "''");

async function findChildInRoot(name, token) {
  const url = `${GRAPH_BASE_URL}/me/mailFolders?$filter=displayName eq '${esc(
    name,
  )}'&$top=1`;
  const { data } = await graphGet(url, token);
  return data.value?.[0]?.id || null;
}

async function findChildUnder(parentId, name, token) {
  const url = `${GRAPH_BASE_URL}/me/mailFolders/${parentId}/childFolders?$filter=displayName eq '${esc(
    name,
  )}'&$top=1`;
  const { data } = await graphGet(url, token);
  return data.value?.[0]?.id || null;
}

async function markMessageAsRead(messageId, token) {
  const url = `${GRAPH_BASE_URL}/me/messages/${messageId}`;
  const response = await graphPatch(url, token, { isRead: true });
  return response.data;
}

export async function getFolderIdByPath(path, token) {
  const parts = path.split("/").filter(Boolean);

  let currentId = await findChildInRoot(parts[0], token);

  if (!currentId) {
    const { data } = await graphGet(
      `${GRAPH_BASE_URL}/me/mailFolders/inbox`,
      token,
    );
    currentId = await findChildUnder(data.id, parts[0], token);
    if (!currentId)
      throw new Error(`No encontré la carpeta raíz "${parts[0]}"`);
  }

  for (let i = 1; i < parts.length; i++) {
    const nextId = await findChildUnder(currentId, parts[i], token);
    if (!nextId) throw new Error(`No encontré subcarpeta "${parts[i]}"`);
    currentId = nextId;
  }
  return currentId;
}

export async function fetchBodiesByBatch(ids, token) {
  const url = `${GRAPH_BASE_URL}/$batch`;
  const results = new Map();

  for (let i = 0; i < ids.length; i += 20) {
    const slice = ids.slice(i, i + 20);
    const batch = {
      requests: slice.map((id, idx) => ({
        id: String(idx + 1),
        method: "GET",
        url: `/me/messages/${id}?$select=body`,
        headers: { Prefer: 'outlook.body-content-type="text"' },
      })),
    };

    const { data } = await graphPost(url, token, batch, {
      headers: { Prefer: 'outlook.body-content-type="text"' },
    });

    for (const r of data.responses) {
      const realId = slice[Number(r.id) - 1];
      results.set(
        realId,
        r.status === 200 ? (r.body?.body?.content ?? "") : "",
      );
    }
  }

  return results;
}

export async function getMessagesFromFolderPath(
  path,
  token,
  parseFn,
  userId,
  { top = 200 } = {},
) {
  const folderId = await getFolderIdByPath(path, token);

  const params = {
    $top: Math.min(top, 100),
    $select: "id,subject,from,receivedDateTime,isRead",
    $orderby: "receivedDateTime desc",
  };

  let url = `${GRAPH_BASE_URL}/me/mailFolders/${folderId}/messages`;
  const out = [];

  while (url && out.length < top) {
    const { data } = await graphGet(url, token, { params });
    out.push(...data.value);
    url = data["@odata.nextLink"];
    params.$top = params.$select = params.$orderby = undefined;
  }

  const ids = out.map((m) => m.id);
  const bodies = await fetchBodiesByBatch(ids, token);

  for (const m of out) {
    m.bodyText = parseFn(bodies.get(m.id) || "");
    console.log("---------------------------------------");
    if (m.bodyText.amount && m.bodyText.transactionDate) {
      const expenseInformation = {
        amount: m.bodyText.amount,
        description: m.subject,
        state: "payed",
        transactionDate: m.bodyText.transactionDate,
        paymentMethod: m.bodyText.paymentMethod,
        authorizationCode: m.bodyText.authorizationCode,
        merchant: m.bodyText.merchant,
        userId: userId,
      };
      const expenseAdded = await addExpense(expenseInformation);
      console.log(`Expense added to database with ID: ${expenseAdded}`);

      const messageMarked = await markMessageAsRead(m.id, token);
      console.log(`Marked message ${m.id} as read:`, messageMarked.isRead);
    } else {
      console.warn(
        `Message ${m.id} no tiene datos de gasto válidos, no lo marco como leído.`,
      );
    }
    console.log(`Parsed message ${m.id}:`, m.bodyText);
    console.log("---------------------------------------");
  }

  return out.slice(0, top);
}
