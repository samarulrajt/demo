import { Signal } from '@angular/core';

export abstract class AuthService {
  abstract authenticated: Signal<boolean>;
  abstract userProfile: Signal<any | null>;
  abstract roles: Signal<string[]>;

  abstract init(): Promise<boolean>;
  abstract login(): Promise<void>;
  abstract logout(): Promise<void>;
  abstract getToken(): Promise<string>;
  abstract hasRole(role: string): boolean;
}