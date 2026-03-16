import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import  { getUserInformation }  from "../services/UserService.js";

let userId = "";

async function authLogin(req, res, next) {
  try {
    const url = await buildAuthUrl();
    console.log("ramses data login: ", url);
    if( req.params.id  ){
      userId = req.params.id;
      console.log("Iniciando autenticación para el usuario ID:", userId);
    }
    res.redirect(url);
  } catch (e) {
    next(e);
  }
}

function user_information(req, res, next) {
  return getUserInformation()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      next(error);
    });
}


async function authRedirect(req, res, next) {
  try {
    console.log("Código de autorización recibido:", req.query.code);
    console.log("query:", req.query);

    const result = await handleAuthCode(req.query.code);

    /*
    const existingUser = await getUserById(userId);
    console.log( "User information registed: ", existingUser );

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
      */

    res.send(`✅ Autenticado como ${result.tokenByCode.account.username}.`);
  } catch (e) {
    next(e);
  }
}

export { authLogin, authRedirect, user_information };
