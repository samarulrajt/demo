export const environment = {
  production: false,
  useMockAuth: true, // 🔀 toggle between real and mock auth
  auth: {
    issuer: 'http://localhost:8080/realms/myrealm',
    clientId: 'my-angular-client',
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email roles',
    showDebugInformation: true
  }
};