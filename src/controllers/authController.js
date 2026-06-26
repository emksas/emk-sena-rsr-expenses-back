import { buildAuthUrl, handleAuthCode } from "../services/msAuthService.js";
import {
  createUserInformation,
  getUserById
} from "../services/UserService.js";

const DEFAULT_LARAVEL_RETURN_URL =
  process.env.LARAVEL_AUTH_RETURN_URL || "http://localhost:8000/microsoft/auth/callback";

const ALLOWED_RETURN_URLS = (
  process.env.AUTH_ALLOWED_RETURN_URLS || DEFAULT_LARAVEL_RETURN_URL
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
  return isAllowedReturnTo(returnTo) ? returnTo : DEFAULT_LARAVEL_RETURN_URL;
}

function redirectToLaravel(res, returnTo, params) {
  const redirectUrl = new URL(getSafeReturnTo(returnTo));

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      redirectUrl.searchParams.set(key, value);
    }
  });

  return res.redirect(redirectUrl.toString());
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

async function authLogin(req, res, next) {
  try {
    const { id } = req.params;
    const returnTo = getSafeReturnTo(req.query.returnTo);

    console.log("ID recibido en authLogin:", id);

    const authUrl = await buildAuthUrl(id, returnTo);
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

    if (error) {
      return redirectToLaravel(res, returnTo, {
        microsoft_auth: "error",
        message: error_description || error,
      });
    }

    if (!code) {
      return redirectToLaravel(res, returnTo, {
        microsoft_auth: "error",
        message: "Microsoft did not return an authorization code",
      });
    }

    const result = await handleAuthCode(code);
    const existingUser = await getUserById(userId);

    if (existingUser.length > 0) {
      return redirectToLaravel(res, returnTo, {
        microsoft_auth: "success",
        user_id: userId,
        username: existingUser[0].username,
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

    return redirectToLaravel(res, returnTo, {
      microsoft_auth: "success",
      user_id: userId,
      username: result.tokenByCode.account.username,
    });
  } catch (e) {
    next(e);
  }
}

export { authLogin, authRedirect };
