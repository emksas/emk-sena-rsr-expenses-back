const msal = require('@azure/msal-node');

const cca = new msal.ConfidentialClientApplication({
    auth: {
        clientId: '85bb9e6b-a3d2-45ab-9014-c803bd3d2e5b',
        authority: `https://login.microsoftonline.com/16c21427-f2c0-4501-ba6e-2c065e2ca7f7`,
        clientSecret: 'Qxr8Q~qEsb~RJ4Bbf8YvOpcqdWwT3cx7Kp4r3c7l',
    },
});

async function getAppToken() {
    const { accessToken} = await cca.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default'],
    });
    return accessToken;
}

module.exports = { getAppToken };