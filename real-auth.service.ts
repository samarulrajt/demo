import { Injectable, signal } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  authenticated = signal(false);
  userProfile = signal<any | null>(null);
  roles = signal<string[]>([]);

  constructor(private oauthService: OAuthService) {
    const authConfig: AuthConfig = environment.auth;
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh(); // 🚀 auto refresh token
  }

  async init(): Promise<boolean> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthService.hasValidAccessToken()) {
        this.authenticated.set(true);
        this.loadUserProfile();
        this.updateRoles();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth init error', err);
      return false;
    }
  }

  async login() {
    await this.oauthService.initLoginFlow();
  }

  async logout() {
    this.oauthService.logOut();
    this.authenticated.set(false);
    this.userProfile.set(null);
    this.roles.set([]);
  }

  async getToken(): Promise<string> {
    return this.oauthService.getAccessToken();
  }

  private async loadUserProfile() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (claims) {
      this.userProfile.set({
        username: claims.preferred_username,
        email: claims.email,
        firstName: claims.given_name,
        lastName: claims.family_name
      });
    }
  }

  private updateRoles() {
    const claims: any = this.oauthService.getIdentityClaims();
    const realmRoles = claims?.realm_access?.roles || [];
    const clientRoles = claims?.resource_access?.[environment.auth.clientId]?.roles || [];
    this.roles.set([...realmRoles, ...clientRoles]);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}