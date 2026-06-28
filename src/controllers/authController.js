import {
  buildAuthUrl,
  buildServerAuthRedirectUrl,
  handleAuthCode,
} from "../services/msAuthService.js";
import {
  createUserInformation,
  getUserById
} from "../services/UserService.js";

const DEFAULT_LARAVEL_RETURN_URL =
  process.env.LARAVEL_AUTH_RETURN_URL || "http://localhost:8000/microsoft/auth/callback";
const DEFAULT_BROWSER_RETURN_URL =
  process.env.BROWSER_AUTH_RETURN_URL || "http://localhost:3000/microsoft/auth/callback";
const DEFAULT_AUTH_RETURN_URL =
  process.env.AUTH_RETURN_URL || DEFAULT_BROWSER_RETURN_URL;

const ALLOWED_RETURN_URLS = (
  process.env.AUTH_ALLOWED_RETURN_URLS ||
  `${DEFAULT_AUTH_RETURN_URL},${DEFAULT_LARAVEL_RETURN_URL}`
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

function isAllowedReturnTo(returnTo) {
  if (!returnTo) {
    return false;
  }

  try {
    const requestedUrl = new URL(returnTo);
    return ALLOWED_RETURN_URLS.some((allowedReturnUrl) => {
      const allowedUrl = new URL(allowedReturnUrl);
      return requestedUrl.origin === allowedUrl.origin;
    });
  } catch {
    return false;
  }
}

function getSafeReturnTo(returnTo) {
  return isAllowedReturnTo(returnTo) ? returnTo : DEFAULT_AUTH_RETURN_URL;
}

function parseState(state) {
  if (!state) {
    return {};
  }

  try {
    return JSON.parse(state);
  } catch {
    return {};
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAuthCallbackHtml(res, statusCode, params) {
  const { microsoft_auth, user_id, username, message, returnTo } = params;
  const isSuccess = microsoft_auth === "success";
  const safeStatus = escapeHtml(microsoft_auth || "sin_estado");
  const safeUserId = user_id ? escapeHtml(user_id) : "";
  const safeUsername = username ? escapeHtml(username) : "";
  const safeMessage = message ? escapeHtml(message) : "";

  return res.status(statusCode).send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Microsoft auth callback</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #1f2937;
          }
          main {
            max-width: 720px;
          }
          code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
      <script>

        const success = ${JSON.stringify(isSuccess)};
        const message = ${JSON.stringify(message || null)};
        const userId = ${JSON.stringify(user_id || null)};
        const username = ${JSON.stringify(username || null)};
        
        console.log(success); 
        console.log(message); 
        console.log(userId);
        console.log(username);
        console.log(window.location.origin);
        console.log(window.opener);

        if (window.opener) {
            window.opener.postMessage({
                type: 'MICROSOFT_AUTH_FINISHED',
                success: success,
                message: message,
                userId: userId,
                username: username
            }, ${JSON.stringify(returnTo)});

            // window.close();
        } else {
            window.location.href = '/';
        }
    </script>
        <main>
          <h1>${isSuccess ? "Autenticacion completada" : "Error en autenticacion"}</h1>
          <p>Estado: <code>${safeStatus}</code></p>
          ${safeUserId ? `<p>User ID: <code>${safeUserId}</code></p>` : ""}
          ${safeUsername ? `<p>Usuario Microsoft: <code>${safeUsername}</code></p>` : ""}
          ${safeMessage ? `<p>Mensaje: <code>${safeMessage}</code></p>` : ""}
        </main>
      </body>
    </html>
  `);
}

async function authLogin(req, res, next) {
  try {
    const { id } = req.params;
    console.log("bandera para validar si es de laravel o no: ", req.query.returnTo);
    const returnTo = getSafeReturnTo(req.query.returnTo);

    console.log("respuesta desde el metodo formado", returnTo);


    console.log("ID recibido en authLogin:", id);

    const authUrl = await buildAuthUrl(id, returnTo, req);
    console.log("ruta de autorizacion desde navegador", authUrl);
    res.redirect(authUrl);
  } catch (e) {
    next(e);
  }
}

async function authRedirect(req, res, next) {
  try {
    const { code, state, error, error_description } = req.query;
    const parsedState = parseState(state);
    const userId = parsedState.userId;
    const returnTo = parsedState.returnTo;
    console.log("returnTo recibido en authRedirect:", returnTo);

    if (error) {
      return renderAuthCallbackHtml(res, 400, {
        microsoft_auth: "error",
        message: error_description || error,
      });
    }

    if (!code) {
      return renderAuthCallbackHtml(res, 400, {
        microsoft_auth: "error",
        message: "Microsoft did not return an authorization code",
      });
    }

    const redirectUri = buildServerAuthRedirectUrl(req);
    console.log("redirectUri usado para intercambiar el codigo:", redirectUri);

    const result = await handleAuthCode(code, redirectUri);
    const existingUser = await getUserById(userId);

    if (existingUser.length > 0) {
      return renderAuthCallbackHtml(res, 200, {
        microsoft_auth: "success",
        user_id: userId,
        username: existingUser[0].username,
        returnTo: returnTo
      });
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

    return renderAuthCallbackHtml(res, 200, {
      microsoft_auth: "success",
      user_id: userId,
      username: result.tokenByCode.account.username,
    });
  } catch (e) {
    next(e);
  }
}

function authBrowserCallback(req, res) {
  const { microsoft_auth, user_id, username, message } = req.query;

  return renderAuthCallbackHtml(res, microsoft_auth === "success" ? 200 : 400, {
    microsoft_auth,
    user_id,
    username,
    message,
  });
}

export { authLogin, authRedirect, authBrowserCallback };
