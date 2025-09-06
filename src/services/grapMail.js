const axios = require('axios');
const { getAppToken } = require('../config/auth');
const targetUser = 'rammses.93_outlook.com#EXT#@rammses93outlook.onmicrosoft.com';

async function getFolderByName() {
    const token = await getAppToken();
    const url = `https://graph.microsoft.com/v1.0/users/${targetUser}/mailFolders`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return data.value; 
}

async function getEmailsFromFolder(folderId) {
    const token = await getAppToken();
    const url = `https://graph.microsoft.com/v1.0/users/${tarsetUser}/mailFolders/${folderId}/messages`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return data.value; 
}

module.exports = { getFolderByName, getEmailsFromFolder };