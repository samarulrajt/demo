import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // if not logged in → redirect to login
    if (!auth.authenticated()) {
      auth.login();
      return false;
    }

    // check required roles
    const hasRole = requiredRoles.some(role => auth.hasRole(role));
    if (!hasRole) {
      router.navigate(['/forbidden']);
      return false;
    }

    return true;
  };
}