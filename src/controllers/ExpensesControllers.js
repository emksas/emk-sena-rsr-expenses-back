const expensesService = require("../services/expensesService");
const Expense = require("../models/Expense");
const { getFolderByName } = require("../services/grapMail");
const cca = require("../config/auth").cca;
const axios = require("axios");

let currentAccount = null;

async function getExpenses(req, res) {
  try {
    const folders = await getFolderByName();
    console.log("Fetched folders from Microsoft Graph:", folders);

    //const expenses = await expensesService.getExpenses();
    //res.status(200).json(expenses.map(expense => Expense.fromDatabaseRow(expense)));
    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addExpense(req, res) {
  try {
    const expense = req.body;
    console.log("Received expense data:", expense);
    const expenseId = await expensesService.addExpense(expense);
    res.status(201).json({ id: expenseId });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  if (!currentAccount) throw new Error("No hay account. Visita /auth/login primero.");

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
import axios from "axios";
import { getAccessToken } from "./auth-msal.js"; // tu helper que retorna un access token delegado (acquireTokenSilent)

const G = "https://graph.microsoft.com/v1.0";
const esc = s => s.replace(/'/g, "''"); // escapar comillas para OData

async function findChildInRoot(name, token) {
  const url = `${G}/me/mailFolders?$filter=displayName eq '${esc(name)}'&$top=1`;
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return data.value?.[0]?.id || null;
}
async function findChildUnder(parentId, name, token) {
  const url = `${G}/me/mailFolders/${parentId}/childFolders?$filter=displayName eq '${esc(name)}'&$top=1`;
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return data.value?.[0]?.id || null;
}

/** Resuelve el id de una ruta como "Fianzas/rappi" o "Inbox/Fianzas/rappi" */
export async function getFolderIdByPath(path) {
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
    if (!currentId) throw new Error(`No encontré la carpeta raíz "${parts[0]}" ni en la raíz ni bajo Inbox`);
  }

  // 3) bajar por las siguientes subcarpetas
  for (let i = 1; i < parts.length; i++) {
    const nextId = await findChildUnder(currentId, parts[i], token);
    if (!nextId) throw new Error(`No encontré la subcarpeta "${parts[i]}" dentro de la ruta "${parts.slice(0, i).join("/")}"`);
    currentId = nextId;
  }
  return currentId;
}

/** Lee mensajes de una ruta; ejemplo: "Fianzas/rappi" */
async function getMessagesFromFolderPath(path, { top = 25, unreadOnly = false, subjectContains } = {}) {
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
    out.push(...data.value);
    url = data["@odata.nextLink"]; // next page
    // después del primer GET ya no reenvíes params (nextLink los trae)
    params.$top = params.$select = params.$orderby = params.$filter = params.$search = undefined;
  }
  return out.slice(0, top);
}



module.exports = {
  getExpenses,
  addExpense,
  authLogin,
  authRedirect,
  getMessages,
};
