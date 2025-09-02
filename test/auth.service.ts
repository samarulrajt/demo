// src/app/auth/auth.service.ts
import { Injectable, EnvironmentInjector, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthServiceBase } from './auth.service.base';
import { AuthServiceMock } from './auth.service.mock';
import { AuthServiceProd } from './auth.service.prod';

export function authServiceFactory(): AuthServiceBase {
  const injector = inject(EnvironmentInjector);
  
  if (environment.production) {
    return injector.runInContext(() => new AuthServiceProd());
  } else {
    return injector.runInContext(() => new AuthServiceMock());
  }
}

@Injectable({
  providedIn: 'root',
  useFactory: authServiceFactory
})
export abstract class AuthService extends AuthServiceBase {}