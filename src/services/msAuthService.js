import { encrypt } from "../security/crypto.js";
import { cca } from "../config/auth.js";

const SCOPES = ["openid", "profile", "Mail.ReadWrite", "offline_access"];
const MICROSOFT_REDIRECT_URI =
  process.env.MS_REDIRECT_URI || "http://localhost:3000/api/auth/redirect";

function buildAuthUrl(userId, returnTo) {
  return cca.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: MICROSOFT_REDIRECT_URI,
    state: JSON.stringify({
      userId: userId ?? undefined,
      returnTo: returnTo ?? undefined,
    }),
  });
}

async function handleAuthCode(code) {
  const result = await cca.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: MICROSOFT_REDIRECT_URI,
  });

  const cacheString = cca.getTokenCache().serialize();
  const cacheStringEncode = encrypt(cacheString);

  return { tokenByCode: result, cacheEncrypted: cacheStringEncode };
}

async function getAccessTokenForSession(session) {
  console.log( " desde getAccessTokenForSession ", session.home_account_id )
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
