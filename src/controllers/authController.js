import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";

async function authLogin(req, res, next) {
  try {
    const url = await buildAuthUrl();
    res.redirect(url);
  } catch (e) {
    next(e);
  }
}

async function authRedirect(req, res, next) {
  try {


    console.log("Código de autorización recibido:", req.query.code);
    console.log("query:", req.query);
    // console.log("session:", req.session);

    const result = await handleAuthCode(req.query.code);

    // console.log(result);
    console.log("✅ Autenticado como:", result.account.username);

    /*
    req.session.msalAccount = {
      homeAccountId: result.account.homeAccountId,
      username: result.account.username,
      tenantId: result.account.tenantId,
    };

    res.send(`✅ Autenticado como ${result.account.username}.`);
    */
  } catch (e) {
    next(e);
  }
}

export { authLogin, authRedirect };