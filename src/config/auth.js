const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    authority: process.env.MS_AUTHORITY, // consumers para cuentas personales
  },
});

module.exports = { cca };