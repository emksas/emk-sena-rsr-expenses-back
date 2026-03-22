import { getAccessTokenForSession } from "../services/msAuthService.js";
import { getMessagesFromFolderPath } from "../services/mailService.js";
import { parseRappiCardText } from "../services/parser.js";
import { getUserById } from "../services/UserService.js";

async function getExpensesRappi(req, res, next) {
  try {

    if( !req.query.userId ) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user_id = req.query.userId;
    const userInformation = await getUserById(user_id);
    
    if( !userInformation || userInformation.length === 0 ) {
      return res.status(404).json({ error: "User not found" });
    }

    const userSession = {
      home_account_id: userInformation[0].home_account_id,
      username: userInformation[0].username,
      tenant_id: userInformation[0].tenant_id,
      cache_encrypted: userInformation[0].cache_encrypted,
    }

    console.log("path folder:", req.query.pathFolder);
    
    const token = await getAccessTokenForSession(userSession);

    const emails = await getMessagesFromFolderPath(
      req.query.pathFolder,
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