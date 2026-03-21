import { getAccessTokenForSession } from "../services/msAuthService.js";
import { getMessagesFromFolderPath } from "../services/mailService.js";
//import { parseRappiCardText } from "../services/parser.js"; // aquí mueves tus utils/parser

export async function getExpenses(req, res, next) {
  try {
    console.log( req.session );
    const token = await getAccessTokenForSession(req.session);

    const emails = await getMessagesFromFolderPath(
      "/Finanzas/rappi",
      token,
      { top: 200 }
    );

    console.log("Emails obtenidos:", emails.length);

  } catch (e) {
    next(e);
  }
}
