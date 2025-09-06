const msal = require('@azure/msal-node');
const { OUTLOOK_CLIENT_ID, OUTLOOK_AUTHORITY, OUTLOOK_CLIENT_SECRET } = process.env;



const cca = new msal.ConfidentialClientApplication({
    auth: {
        /*
        clientId: OUTLOOK_CLIENT_ID,
        authority: OUTLOOK_AUTHORITY,
        clientSecret: OUTLOOK_CLIENT_SECRET,
        */
    },
});

async function getAppToken() {
    const { accessToken} = await cca.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default'],
    });
    return accessToken;
}

module.exports = { getAppToken };