// src/app/auth/auth.service.base.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthServiceBase {
  // State signals
  protected authTokenSignal = signal<string | null>(null);
  protected userProfileSignal = signal<any>(null);
  protected rolesSignal = signal<string[]>([]);
  protected initializedSignal = signal<boolean>(false);

  // Computed signals
  isAuthenticated = computed(() => !!this.authTokenSignal());
  accessToken = computed(() => this.authTokenSignal());
  profile = computed(() => this.userProfileSignal());
  roles = computed(() => this.rolesSignal());
  isInitialized = computed(() => this.initializedSignal());

  abstract initialize(): Promise<void>;
  abstract login(): Promise<void>;
  abstract handleAuthCallback(params: URLSearchParams): Promise<void>;
  abstract refreshTokens(): Promise<void>;
  abstract logout(redirect?: boolean): void;
  abstract switchRoles(roles: string[]): void;
}