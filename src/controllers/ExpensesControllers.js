import { getAccessTokenForSession } from "../services/msAuthService.js";
import { getMessagesFromFolderPath } from "../services/mailService.js";
import { parseRappiCardText } from "../services/parser.js"; // aquí mueves tus utils/parser

async function getExpensesRappi(req, res, next) {
  try {
    console.log( req.session );
    const token = await getAccessTokenForSession(req.session);

    const emails = await getMessagesFromFolderPath(
      "/Finanzas/rappi",
      token,
      parseRappiCardText,
      { top: 200 }
    );

    console.log("Emails obtenidos:", emails.length);

    res.status(200).json({ expenses: emails });

  } catch (e) {
    next(e);
  }
}

export { getExpensesRappi };