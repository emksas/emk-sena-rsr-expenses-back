const { ConfidentialClientApplication } = require('@azure/msal-node');
const path = require('path');

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.MS_CLIENT_ID || '85bb9e6b-a3d2-45ab-9014-c803bd3d2e5b',
    clientSecret: process.env.MS_CLIENT_SECRET || 'Qxr8Q~qEsb~RJ4Bbf8YvOpcqdWwT3cx7Kp4r3c7l', // Ensure this is set in your environment variables
    authority: process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/consumers', // consumers para cuentas personales
  },
});

module.exports = { cca };