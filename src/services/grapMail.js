import axios from "axios";
import { getAppToken, getDelegatedToken } from "../config/auth.js";

const targetUser = encodeURIComponent(
  "rammses.93_outlook.com#EXT#@rammses93outlook.onmicrosoft.com"
);

async function getFolderByName() {
  const token = await getDelegatedToken();
  const me = await axios.get("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Me:", me.data.userPrincipalName);
}

export { getFolderByName };
