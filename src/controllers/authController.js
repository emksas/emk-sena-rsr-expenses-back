import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import  { getUserByIdAndHomeAccountId, createUserInformation }  from "../services/UserService.js";

async function authLogin(req, res, next) {
  try {
    let url = await buildAuthUrl( req.query.id );
    res.redirect(url);
  } catch (e) {
    next(e);
  }
}

async function authRedirect(req, res, next) {
  try {

    const { code, state } = req.query;
    const parsedState = state ? JSON.parse(state) : {};
    const userId = parsedState?.userId;
    const result = await handleAuthCode(code);
    const existingUser = await getUserByIdAndHomeAccountId(userId, result.tokenByCode.account.homeAccountId);

    if (existingUser) {
      return res.send(
        `✅ Usuario ${existingUser.username} ya está autenticado.`
      );
    } else {
      const user = {
        user_id: userId,
        home_account_id: result.tokenByCode.account.homeAccountId,
        username: result.tokenByCode.account.username,
        tenant_id: result.tokenByCode.account.tenantId,
        cache_encrypted: result.cacheEncrypted,
      };
      await createUserInformation(user);
    }

    res.send(`✅ Autenticado como ${result.tokenByCode.account.username}.`);

  } catch (e) {
    next(e);
  }
}

export { authLogin, authRedirect };
