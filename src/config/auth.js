import {ConfidentialClientApplication} from '@azure/msal-node';

const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const authority = process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/consumers';

if (!clientId || !clientSecret) {
  throw new Error('MS_CLIENT_ID and MS_CLIENT_SECRET must be configured');
}

const cca = new ConfidentialClientApplication({
  auth: {
    clientId,
    clientSecret,
    authority, // consumers para cuentas personales
  },
});

export { cca };
