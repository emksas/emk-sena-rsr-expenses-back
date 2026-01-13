import { getAccessTokenForSession } from "../services/msAuthService.js";
import { getMessagesFromFolderPath } from "../services/mailService.js";
//import { parseRappiCardText } from "../services/parser.js"; // aquí mueves tus utils/parser

export async function getExpenses(req, res, next) {
  try {
    const token = await getAccessTokenForSession(req.session);

    const emails = await getMessagesFromFolderPath(
      "/Finanzas/rappi",
      token,
  //    parseRappiCardText,
      { top: 200 }
    );

    res.json(emails.map((e) => e.bodyText));
  } catch (e) {
    next(e);
  }
}
