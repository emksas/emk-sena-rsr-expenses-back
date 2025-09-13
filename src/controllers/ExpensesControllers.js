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



module.exports = {
  getExpenses,
  addExpense,
  authLogin,
  authRedirect,
  getMessages,
};
