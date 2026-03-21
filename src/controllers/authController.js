import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import  { getUserInformation }  from "../services/UserService.js";

let userId = "";

async function authLogin(req, res, next) {
  try {
    const url = await buildAuthUrl();

    console.log("URL de autenticación generada:", url);
    console.log( "id del usuario recibido en authLogin:", req.query.id );

    if( req.query.id  ){
      userId = req.query.id;
    }
    res.redirect(url);
  } catch (e) {
    next(e);
  }
}




async function authRedirect(req, res, next) {
  try {

    const result = await handleAuthCode(req.query.code);



    /*
    
    const user = {
        user_id: userId,
        home_account_id: result.tokenByCode.account.homeAccountId,
        username: result.tokenByCode.account.username,
        tenant_id: result.tokenByCode.account.tenantId,
        cache_encrypted: result.cacheEncrypted,
      };
    
    req.session.msalAccount = user;
    */    

    const existingUser = await getUserById(userId);

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
