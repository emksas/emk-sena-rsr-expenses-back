import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";

export async function authLogin(req, res, next) {
  try {
    const url = await buildAuthUrl();
    res.redirect(url);
  } catch (e) {
    next(e);
  }
}

export async function authRedirect(req, res, next) {
  try {
    const result = await handleAuthCode(req.query.code);

    // guarda SOLO lo necesario en session (no tokens)  
    req.session.msalAccount = {
      homeAccountId: result.account.homeAccountId,
      username: result.account.username,
      tenantId: result.account.tenantId,
    };

    res.send(`✅ Autenticado como ${result.account.username}.`);
  } catch (e) {
    next(e);
  }
}
