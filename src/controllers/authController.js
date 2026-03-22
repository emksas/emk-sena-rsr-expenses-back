import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import  { getUserById, createUserInformation }  from "../services/UserService.js";

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
    console.log("Parsed state:", parsedState);
    const userId = parsedState?.userId;
    console.log("User ID from state:", userId);
    const result = await handleAuthCode(code);  
    const existingUser = await getUserById(userId, result.tokenByCode.account.homeAccountId);

    console.log("Resultado de getUserById:", existingUser);

    if (existingUser) {
      console.log("Usuario ya existe en la base de datos:", existingUser);
      return res.send(
        `✅ Usuario ${existingUser.username} ya está autenticado.`
      );
    } else {
      console.log("Creando nuevo usuario en la base de datos para ID:", userId);
      const user = {
        user_id: userId,
        home_account_id: result.tokenByCode.account.homeAccountId,
        username: result.tokenByCode.account.username,
        tenant_id: result.tokenByCode.account.tenantId,
        cache_encrypted: result.cacheEncrypted,
      };
      console.log("Resultado de handleAuthCode:", user);
      await createUserInformation(user);
    }
      

    res.send(`✅ Autenticado como ${result.tokenByCode.account.username}.`);

  } catch (e) {
    next(e);
  }
}

export { authLogin, authRedirect };
