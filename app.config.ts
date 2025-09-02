import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { AuthService } from './auth.service';
import { MockAuthService } from './mock-auth.service';
import { RealAuthService } from './real-auth.service';

function initializeAuth(auth: AuthService) {
  return () => auth.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: AuthService,
      useClass: environment.useMockAuth ? MockAuthService : RealAuthService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};