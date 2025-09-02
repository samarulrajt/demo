// src/app/auth/auth.service.mock.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceBase } from './auth.service.base';

@Injectable()
export class AuthServiceMock extends AuthServiceBase {
  private router = inject(Router);
  private availableRoles: string[] = ['user', 'admin', 'editor', 'viewer'];

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    console.log('Initializing auth service...');
    
    // Check if there's existing auth data
    const storedToken = localStorage.getItem('mock_auth_token');
    const storedProfile = localStorage.getItem('mock_user_profile');
    
    if (storedToken && storedProfile) {
      this.authTokenSignal.set(storedToken);
      const profile = JSON.parse(storedProfile);
      this.userProfileSignal.set(profile);
      this.rolesSignal.set(profile.roles || ['user']);
    }
    
    this.initializedSignal.set(true);
    console.log('Auth service initialized');
  }

  async login(): Promise<void> {
    // Simulate redirect to mock login page
    this.router.navigate(['/mock-login']);
  }

  async handleAuthCallback(params: URLSearchParams): Promise<void> {
    const code = params.get('code');
    
    if (code === 'success') {
      // Generate mock token and profile with default roles
      const token = this.generateMockToken();
      const profile = {
        id: 'mock-user-123',
        name: 'Mock User',
        email: 'mock@example.com',
        roles: ['user'], // Default role
        allRoles: this.availableRoles, // All available roles
        picture: 'https://via.placeholder.com/50'
      };

      // Store data
      localStorage.setItem('mock_auth_token', token);
      localStorage.setItem('mock_user_profile', JSON.stringify(profile));

      // Update signals
      this.authTokenSignal.set(token);
      this.userProfileSignal.set(profile);
      this.rolesSignal.set(profile.roles);

      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      throw new Error('Mock authentication failed');
    }
  }

  async refreshTokens(): Promise<void> {
    if (this.authTokenSignal()) {
      const newToken = this.generateMockToken();
      this.authTokenSignal.set(newToken);
      localStorage.setItem('mock_auth_token', newToken);
    }
  }

  logout(redirect: boolean = true): void {
    this.authTokenSignal.set(null);
    this.userProfileSignal.set(null);
    this.rolesSignal.set([]);
    
    localStorage.removeItem('mock_auth_token');
    localStorage.removeItem('mock_user_profile');

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  switchRoles(roles: string[]): void {
    // Filter to only allow available roles
    const validRoles = roles.filter(role => 
      this.availableRoles.includes(role)
    );
    
    if (validRoles.length === 0) {
      console.warn('No valid roles provided, keeping current roles');
      return;
    }
    
    // Update roles signal
    this.rolesSignal.set(validRoles);
    
    // Update profile if user is authenticated
    const currentProfile = this.userProfileSignal();
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        roles: validRoles
      };
      this.userProfileSignal.set(updatedProfile);
      localStorage.setItem('mock_user_profile', JSON.stringify(updatedProfile));
    }
    
    console.log('Roles switched to:', validRoles);
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'mock-user-123',
      name: 'Mock User',
      email: 'mock@example.com',
      roles: this.rolesSignal(),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = 'mock-signature';
    
    return `${header}.${payload}.${signature}`;
  }
}