import { encrypt } from "../security/crypto.js";
import { cca } from "../config/auth.js";

const SCOPES = ["openid", "profile", "Mail.ReadWrite", "offline_access"];

function buildAuthUrl(userId) {
  
  return cca.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: "http://localhost:3000/api/auth/redirect",
    state: JSON.stringify({
        userId: userId ?? undefined,
    }),
  });
}

async function handleAuthCode(code) {
  const result = await cca.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: "http://localhost:3000/api/auth/redirect",
  });

  const cacheString = cca.getTokenCache().serialize();
  const cacheStringEncode = encrypt(cacheString);

  return { tokenByCode: result, cacheEncrypted: cacheStringEncode };
}

async function getAccessTokenForSession(session) {
  if (!session?.home_account_id) {
    throw new Error("No session provided");
  }

  const account = await cca
    .getTokenCache()
    .getAccountByHomeId(session.home_account_id);

  if (!account) {
    throw new Error("No account found for the session");
  }

  const result = await cca.acquireTokenSilent({
    account,
    scopes: ["Mail.ReadWrite"],
  });

  return result.accessToken;
}

function getUserInformation(req, res, next) {
  res.send("Información del usuario");
}

export {
  buildAuthUrl,
  handleAuthCode,
  getAccessTokenForSession,
  getUserInformation,
};
