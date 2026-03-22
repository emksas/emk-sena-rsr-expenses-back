import pool from "../config/db.js";

async function getUserInformation() {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM user_information", (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

async function createUserInformation(user) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO public.user_information( user_id, home_account_id, username, tenant_id, cache_encrypted) VALUES ($1, $2, $3, $4, $5);";
    pool.query(
      query,
      [
        user.user_id,
        user.home_account_id,
        user.username,
        user.tenant_id,
        user.cache_encrypted,
      ],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      },
    );
  });
}

async function getUserById(userId, homeAccountId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM public.user_information WHERE id = $1 and home_account_id = $2;";
    pool.query(query, [userId, homeAccountId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
}

export { getUserInformation, createUserInformation, getUserById };
