import express from "express";
import {
  getExpensesRappi,
  getExpensesByUserId,
  getExpensesByUserIdAndDateRange,
} from "../controllers/ExpensesControllers.js";

const routerExpenses = express.Router();

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get expenses
 *     responses:
 *       200:
 *         description: A list of expenses from email parsing
 *         content:
 *           application/json:
 */
routerExpenses.get("/expenses", getExpensesRappi);

/**
 * @swagger
 * /expenses/{userId}:
 *  get:
 *    summary: Get expenses by user ID from database, this endpoint gets the expenses that were added to the database, either from email parsing or from other sources
 *    parameters:
 *      - in: path
 *       name: userId
 *      required: true
 *     schema:
 *      type: string
 *   responses:
 *    200:
 *     description: A list of expenses for the specified user ID
 */
routerExpenses.get("/expenses/:userId", getExpensesByUserId);

/**
 * @swagger
 * /expenses/{userId}/date-range:
 *  get:
 *   summary: Get expenses by user ID and date range from database, this endpoint gets the expenses that were added to the database, either from email parsing or from other sources, filtered by a date range
 *  parameters:
 *    - in: path
 *     name: userId
 *   required: true
 *  - in: query
 *  name: startDate
 * required: true
 * schema:
 * type: string
 * - in: query
 * name: endDate
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: A list of expenses for the specified user ID and date range
 */
routerExpenses.get(
  "/expenses/:userId/date-range",
  getExpensesByUserIdAndDateRange,
);

export { routerExpenses };
