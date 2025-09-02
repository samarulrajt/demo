// src/app/auth/auth.service.token.ts
import { InjectionToken, EnvironmentInjector, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthServiceBase } from './auth.service.base';
import { AuthServiceMock } from './auth.service.mock';
import { AuthServiceProd } from './auth.service.prod';

export const AUTH_SERVICE = new InjectionToken<AuthServiceBase>('AuthService', {
  providedIn: 'root',
  factory: () => {
    const injector = inject(EnvironmentInjector);
    
    if (environment.production) {
      return injector.runInContext(() => new AuthServiceProd());
    } else {
      return injector.runInContext(() => new AuthServiceMock());
    }
  }
});