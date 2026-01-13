import { encrypt } from "../security/crypto.js";
import { cca } from "../config/auth.js";

const SCOPES = ["openid", "profile", "Mail.ReadWrite", "offline_access"];

function buildAuthUrl() {

    return cca.getAuthCodeUrl({
        scopes: SCOPES,
        redirectUri: "http://localhost:3000/api/auth/redirect",
    })
}

async function handleAuthCode(code){
    const result = await cca.acquireTokenByCode({
        code,
        scopes: SCOPES,
        redirectUri: "http://localhost:3000/api/auth/redirect",
    });

    const cacheString = cca.getTokenCache().serialize();

    const cacheStringEncode = encrypt(cacheString);
    console.log("msal cache (encrypted):", cacheStringEncode);



    return {tokenByCode: result, cacheEncrypted: cacheStringEncode};
}

async function getAccessTokenForSession(session){
    if(!session?.msalAccount){
        throw new Error("No session provided");
    }

    const accounts = await cca.getTokenCache().getAllAccounts();
    const account = accounts.find(acc => acc.homeAccountId === session.msalAccount.homeAccountId);

    if(!account){
        throw new Error("No account found for the session");
    }

    const result = await cca.acquireTokenSilent({
        account,
        scopes: ["Mail.ReadWrite"],
    });

    return result.accessToken;
}

export { buildAuthUrl, handleAuthCode, getAccessTokenForSession };