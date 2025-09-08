const axios = require("axios");
const { getAppToken } = require("../config/auth");
const targetUser = encodeURIComponent(
  "rammses.93_outlook.com#EXT#@rammses93outlook.onmicrosoft.com"
);

const { getDelegatedToken } = require("../config/auth");

async function getFolderByName() {
  const token = await getDelegatedToken();
  const me = await axios.get("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Me:", me.data.userPrincipalName);
}

module.exports = { getFolderByName };
