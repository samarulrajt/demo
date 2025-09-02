export const environment = {
  production: true,
  useMockAuth: false,
  auth: {
    issuer: 'https://auth.mycompany.com/realms/prod',
    clientId: 'my-angular-client',
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email roles'
  }
};