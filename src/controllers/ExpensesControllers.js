import {cca} from "../config/auth.js";
import axios from "axios";

let currentAccount = null;

async function getExpenses(req, res) {
  try {
    getMessagesFromFolderPathHandler().then((messages) => {
      const getExpensesFromEmails = messages.map((email) => email.bodyText);
      console.log("Fetched expenses from emails:", getExpensesFromEmails);
      res.status(200).json(getExpensesFromEmails);
    });
  } catch (error) {
    console.log("Error fetching expenses:", error);
    res.status(500).json({
      error: "Internal Server Error",
      description: error.message,
    });
  }
}

async function authLogin(req, res, next) {
  try {
    const authUrl = await cca.getAuthCodeUrl({
      scopes: ["openid", "profile", "offline_access", "Mail.Read"],
      redirectUri: "http://localhost:3000/api/expenses/auth/redirect",
    });
    res.redirect(authUrl);
  } catch (e) {
    next(e);
  }
}

async function authRedirect(req, res, next) {
  try {
    const r = await cca.acquireTokenByCode({
      code: req.query.code,
      scopes: ["Mail.Read", "offline_access"],
      redirectUri: "http://localhost:3000/api/expenses/auth/redirect",
    });
    console.log("Token acquired:", r);
    currentAccount = r.account; // guarda la cuenta del usuario
    //    req.session.account = r.account; // guarda la cuenta del usuario
    res.send("✅ Autenticado. Ya puedes llamar /api/messages");
  } catch (e) {
    next(e);
  }
}

async function getAccessToken() {
  if (!currentAccount) {
    const accounts = await cca.getTokenCache().getAllAccounts();
    if (accounts.length) currentAccount = accounts[0];
  }
  if (!currentAccount)
    throw new Error("No hay account. Visita /auth/login primero.");

  const { accessToken } = await cca.acquireTokenSilent({
    account: currentAccount,
    scopes: ["Mail.Read"],
  });
  return accessToken;
}

async function getMessages(req, res, next) {
  try {
    const token = await getAccessToken();
    const { data } = await axios.get(
      "https://graph.microsoft.com/v1.0/me/mailFolders/Finanzas/rappi/messages?$top=10",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
}

// folders.js

const G = "https://graph.microsoft.com/v1.0";
const esc = (s) => s.replace(/'/g, "''"); // escapar comillas para OData

async function findChildInRoot(name, token) {
  const url = `${G}/me/mailFolders?$filter=displayName eq '${esc(
    name
  )}'&$top=1`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.value?.[0]?.id || null;
}

async function findChildUnder(parentId, name, token) {
  const url = `${G}/me/mailFolders/${parentId}/childFolders?$filter=displayName eq '${esc(
    name
  )}'&$top=1`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.value?.[0]?.id || null;
}

/** Resuelve el id de una ruta como "Fianzas/rappi" o "Inbox/Fianzas/rappi" */
async function getFolderIdByPath(path) {
  const token = await getAccessToken();
  const parts = path.split("/").filter(Boolean);

  // 1) intentar desde raíz
  let currentId = await findChildInRoot(parts[0], token);

  // 2) si no existe en raíz, probar como subcarpeta de Inbox
  if (!currentId) {
    // id de la well-known 'inbox'
    const { data } = await axios.get(`${G}/me/mailFolders/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    currentId = await findChildUnder(data.id, parts[0], token);
    if (!currentId)
      throw new Error(
        `No encontré la carpeta raíz "${parts[0]}" ni en la raíz ni bajo Inbox`
      );
  }

  // 3) bajar por las siguientes subcarpetas
  for (let i = 1; i < parts.length; i++) {
    const nextId = await findChildUnder(currentId, parts[i], token);
    if (!nextId)
      throw new Error(
        `No encontré la subcarpeta "${parts[i]}" dentro de la ruta "${parts
          .slice(0, i)
          .join("/")}"`
      );
    currentId = nextId;
  }
  return currentId;
}

/** Pide 'body' de muchos mensajes en lotes de 20 usando $batch */
async function fetchBodiesByBatch(ids) {
  const token = await getAccessToken();
  const url = `${G}/$batch`;
  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    // body como TEXTO (si prefieres HTML, usa "html")
    Prefer: 'outlook.body-content-type="text"',
  };

  const results = new Map(); // id -> bodyText

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

    const { data } = await axios.post(url, batch, { headers: commonHeaders });
    for (const r of data.responses) {
      if (r.status === 200) {
        results.set(
          // r.id es 1..20 en este sublote, mapéalo a ids reales
          slice[Number(r.id) - 1],
          r.body?.body?.content ?? ""
        );
      } else {
        results.set(slice[Number(r.id) - 1], ""); // o maneja error por id
      }
    }
  }

  return results; // Map(id -> bodyText)
}

// utils.js
function stripNoise(raw) {
  return (
    String(raw)
      // quita tags tipo [630x187x1] o [icon]
      .replace(/\[[^\]\n]*\]/g, "")
      // quita URLs entre <...>
      .replace(/<https?:\/\/[^>\s]+>/gi, "")
      // normaliza guiones/underscores separadores
      .replace(/[_\-]{5,}/g, "\n")
      // normaliza saltos
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function normalizeKey(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin acentos
    .replace(/[^a-z0-9]/g, ""); // sin espacios/símbolos
}

function parseCurrencyToNumber(s = "") {
  // acepta "$30.000", "30,000.50", "COP 30.000,50", etc.
  const only = s.replace(/[^\d.,-]/g, "");
  const lastComma = only.lastIndexOf(",");
  const lastDot = only.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";

  const normalized = only
    .replace(new RegExp(`\\${decimalSep}(?=\\d{1,2}$)`), ".") // separador decimal a punto
    .replace(/[.,](?=\d{3}(?:\D|$))/g, ""); // quita miles

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseDateFlexible(s = "") {
  const txt = s.trim();
  // yyyy-mm-dd hh:mm(:ss)?
  let m = txt.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, Y, M, D, h = "00", m2 = "00", s2 = "00"] = m;
    const iso = `${Y}-${M}-${D}T${h}:${m2}:${s2}Z`;
    const d = new Date(iso);
    return isNaN(d) ? null : d.toISOString();
  }
  // dd/mm/yyyy hh:mm(:ss)?
  m = txt.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, d, M, Y, h = "00", m2 = "00", s2 = "00"] = m;
    const iso = `${Y}-${M}-${d}T${h}:${m2}:${s2}Z`;
    const dt = new Date(iso);
    return isNaN(dt) ? null : dt.toISOString();
  }
  return null;
}

/**
 * Parser principal para el formato de RappiCard (texto plano).
 * Devuelve: { amount, paymentMethod, authorizationCode, merchant, transactionDate }
 */
function parseRappiCardText(rawText) {
  const cleaned = stripNoise(rawText);

  const lines = cleaned
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Mapeo de rótulos posibles -> clave destino
  const KEY_MAP = new Map([
    ["monto", "amount"],
    ["metododepago", "paymentMethod"],
    ["no.deautorizacion", "authorizationCode"],
    ["nodeautorizacion", "authorizationCode"],
    ["numerodeautorizacion", "authorizationCode"],
    ["autorizacion", "authorizationCode"],
    ["comercio", "merchant"],
    ["fechadelatransaccion", "transactionDate"],
    ["fechadetransaccion", "transactionDate"],
    ["fechatransaccion", "transactionDate"],
  ]);

  const result = {
    amount: null,
    paymentMethod: null,
    authorizationCode: null,
    merchant: null,
    transactionDate: null,
  };

  // recorre líneas: cuando encuentra un rótulo conocido, toma la siguiente línea útil como valor
  for (let i = 0; i < lines.length; i++) {
    const keyNorm = normalizeKey(lines[i]);
    const dest = KEY_MAP.get(keyNorm);
    if (!dest) continue;

    // tomar la próxima línea no vacía como valor
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    const value = lines[j] ?? "";

    if (dest === "amount") {
      result.amount = parseCurrencyToNumber(value);
    } else if (dest === "transactionDate") {
      result.transactionDate = parseDateFlexible(value) || value;
    } else {
      result[dest] = value;
    }
  }

  return result;
}

/** Lee mensajes de una ruta; ejemplo: "Fianzas/rappi" */
async function getMessagesFromFolderPath(
  path,
  { top = 200, unreadOnly = false, subjectContains } = {}
) {
  const token = await getAccessToken();
  const folderId = await getFolderIdByPath(path);

  const params = {
    $top: Math.min(top, 100),
    $select: "id,subject,from,receivedDateTime,isRead,hasAttachments",
    $orderby: "receivedDateTime desc",
  };
  const headers = { Authorization: `Bearer ${token}` };

  if (unreadOnly) params.$filter = "isRead eq false";
  if (subjectContains) {
    headers.ConsistencyLevel = "eventual";
    params.$search = `"${subjectContains}"`;
  }

  // paginación simple
  let url = `${G}/me/mailFolders/${folderId}/messages`;
  const out = [];
  while (url && out.length < top) {
    const { data } = await axios.get(url, { params, headers });
    console.log("Fetched", data.value.length, "messages");
    out.push(...data.value);
    url = data["@odata.nextLink"]; // next page
    // después del primer GET ya no reenvíes params (nextLink los trae)
    params.$top =
      params.$select =
      params.$orderby =
      params.$filter =
      params.$search =
        undefined;
  }

  const ids = out.map((m) => m.id);
  const bodies = await fetchBodiesByBatch(ids);
  for (const m of out) {
    const obj = parseRappiCardText(bodies.get(m.id) || "");
    m.bodyText = obj;
  }
  return out.slice(0, top);
}

async function getMessagesFromFolderPathHandler() {
  const correos = await getMessagesFromFolderPath("/Finanzas/rappi", {
    top: 200, // cuántos quieres
    unreadOnly: false, // solo no leídos (opcional)
    // subjectContains: "Factura", // búsqueda en asunto/cuerpo (opcional)
  });

  return correos;
}

export {
  getExpenses,
  authLogin,
  authRedirect,
  getMessages,
  getMessagesFromFolderPathHandler,
};
