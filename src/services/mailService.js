import { G, graphGet, graphPost } from "./graphClient.js";

const esc = (s) => s.replace(/'/g, "''");

async function findChildInRoot(name, token) {
  const url = `${G}/me/mailFolders?$filter=displayName eq '${esc(
    name
  )}'&$top=1`;
  const { data } = await graphGet(url, token);
  return data.value?.[0]?.id || null;
}

async function findChildUnder(parentId, name, token) {
  const url = `${G}/me/mailFolders/${parentId}/childFolders?$filter=displayName eq '${esc(
    name
  )}'&$top=1`;
  const { data } = await graphGet(url, token);
  return data.value?.[0]?.id || null;
}

export async function getFolderIdByPath(path, token) {
  const parts = path.split("/").filter(Boolean);

  let currentId = await findChildInRoot(parts[0], token);

  if (!currentId) {
    const { data } = await graphGet(`${G}/me/mailFolders/inbox`, token);
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
  const url = `${G}/$batch`;
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
      results.set(realId, r.status === 200 ? r.body?.body?.content ?? "" : "");
    }
  }

  return results;
}

// Aquí llamas tu parseRappiCardText(...) tal cual la tienes (lo puedes importar)
export async function getMessagesFromFolderPath(
  path,
  token,
  parseFn,
  { top = 200 } = {}
) {
  const folderId = await getFolderIdByPath(path, token);

  const params = {
    $top: Math.min(top, 100),
    $select: "id,subject,from,receivedDateTime,isRead",
    $orderby: "receivedDateTime desc",
  };

  let url = `${G}/me/mailFolders/${folderId}/messages`;
  const out = [];

  while (url && out.length < top) {
    const { data } = await graphGet(url, token, { params });
    out.push(...data.value);
    url = data["@odata.nextLink"];
    // nextLink ya trae params, así que no los reenvíes:
    params.$top = params.$select = params.$orderby = undefined;
  }

  const ids = out.map((m) => m.id);
  const bodies = await fetchBodiesByBatch(ids, token);

  for (const m of out) {
    m.bodyText = parseFn(bodies.get(m.id) || "");
  }

  return out.slice(0, top);
}
