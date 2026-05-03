import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import {
  getUserByIdAndHomeAccountId,
  createUserInformation,
  getUserById
} from "../services/UserService.js";

async function authLogin(req, res, next) {
  try {
    let url = await buildAuthUrl(req.query.id);
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

    const existingUser = await getUserById(userId);
    //const existingUser = await getUserByIdAndHomeAccountId(userId, result.tokenByCode.account.homeAccountId);

    console.log("Usuario existente en la base de datos:");
    console.log(existingUser);

    if (existingUser) {
      return res.send(
        `✅ Usuario ${existingUser[0].username} ya está autenticado.`,
      );
    } else {
      console.log("Creando nuevo usuario con la información obtenida...");

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
