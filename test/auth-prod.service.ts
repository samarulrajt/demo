// src/app/auth/auth.service.prod.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceBase } from './auth.service.base';

@Injectable() // Removed providedIn: 'root'
export class AuthServiceProd extends AuthServiceBase {
  private authToken: string | null = null;
  private userProfile: any = null;
  private router = inject(Router);

  constructor() {
    super();
    this.initialize();
  }

  async initialize(): Promise<void> {
    // Check for existing auth data
    const token = localStorage.getItem('auth_token');
    const profile = localStorage.getItem('user_profile');
    
    if (token && profile) {
      this.authToken = token;
      this.userProfile = JSON.parse(profile);
      
      // Optional: Validate token expiration
      if (this.isTokenExpired(token)) {
        await this.refreshTokens();
      }
    }
  }

  isAuthenticated = (): boolean => {
    return !!this.authToken && !this.isTokenExpired(this.authToken);
  };

  accessToken = (): string | null => {
    return this.authToken;
  };

  profile = (): any => {
    return this.userProfile;
  };

  async login(): Promise<void> {
    const clientId = 'your-production-client-id';
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth-callback`);
    const scope = encodeURIComponent('openid profile email');
    const responseType = 'code';
    
    const ssoUrl = `https://your-sso-provider.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    
    window.location.href = ssoUrl;
  }

  async handleAuthCallback(params: URLSearchParams): Promise<void> {
    const code = params.get('code');
    const error = params.get('error');
    
    if (error) {
      throw new Error(`Authentication failed: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code);
      this.authToken = tokens.access_token;
      
      // Get user profile
      this.userProfile = await this.getUserProfile(tokens.access_token);
      
      // Store data
      localStorage.setItem('auth_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('user_profile', JSON.stringify(this.userProfile));
      
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
      
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }

  async refreshTokens(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.logout(false);
      throw new Error('No refresh token available');
    }

    try {
      const tokens = await this.refreshAccessToken(refreshToken);
      this.authToken = tokens.access_token;
      
      localStorage.setItem('auth_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout(false);
      throw error;
    }
  }

  logout(redirect: boolean = true): void {
    this.authToken = null;
    this.userProfile = null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');

    // Optional: Redirect to SSO logout
    const logoutUrl = 'https://your-sso-provider.com/logout';
    if (redirect) {
      window.location.href = logoutUrl;
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const response = await fetch('https://your-sso-provider.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'your-production-client-id',
        client_secret: 'your-client-secret',
        redirect_uri: `${window.location.origin}/auth-callback`,
        code: code,
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    return response.json();
  }

  private async getUserProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://your-sso-provider.com/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  private async refreshAccessToken(refreshToken: string): Promise<any> {
    const response = await fetch('https://your-sso-provider.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: 'your-production-client-id',
        client_secret: 'your-client-secret',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}