import { getAccessTokenForSession } from "../services/msAuthService.js";
import { getMessagesFromFolderPath } from "../services/mailService.js";
import { parseRappiCardText } from "../services/parser.js";
import { getByUserId, getByUserIdAndDateRange } from "../services/ExpensesService.js";

async function getEmailExpensesRappi(req, res, next) {
  try {

    if( !req.query.userId ) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userId = req.query.userId;
    const userInformation = await getUserById(userId);

    if( !userInformation || userInformation.length === 0 ) {
      return res.status(404).json({ error: "User not found" });
    }

    const userSession = {
      home_account_id: userInformation[0].home_account_id,
      username: userInformation[0].username,
      tenant_id: userInformation[0].tenant_id,
      cache_encrypted: userInformation[0].cache_encrypted,
    }

    const token = await getAccessTokenForSession(userSession);
    const emails = await getMessagesFromFolderPath(
      req.query.pathFolder,
      token,
      parseRappiCardText,
      userId,
      { top: 200 }
    );

    res.status(200).json({ expenses: emails });
  } catch (e) {
    next(e);
  }
}

async function getExpensesByIdUser(req, res, next) {
  try {
    console.log(`Fetching expenses for user ${req.params.userId}`);
    const userId = req.params.userId;
    console.log(`User ID from request: ${userId}`);
    const expenses = await getByUserId(userId);
    res.status(200).json({ expenses });
  } catch (e) {
    console.error(`Error fetching expenses for user ${req.params.userId}:`, e);
  }
}

async function getExpensesByUserIdDateRange(req, res, next) {
  try {
    const userId = req.params.userId;
    const { startDate, endDate } = req.query;
    const expenses = await getByUserIdAndDateRange(userId, startDate, endDate);
    res.status(200).json({ expenses });
  } catch (e) {
    console.error(`Error fetching expenses for user ${req.params.userId} with date range ${req.query.startDate} - ${req.query.endDate}:`, e);
  }
}

export {
  getEmailExpensesRappi,
  getExpensesByIdUser,
  getExpensesByUserIdDateRange
};