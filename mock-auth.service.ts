import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface MockUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class MockAuthService implements AuthService {
  authenticated = signal(false);
  userProfile = signal<any | null>(null);
  roles = signal<string[]>([]);

  // Fake users for testing
  private mockUsers: Record<string, MockUser> = {
    admin: {
      username: 'admin.dev',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'Dev',
      roles: ['admin', 'user']
    },
    manager: {
      username: 'manager.dev',
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'Dev',
      roles: ['manager']
    },
    user: {
      username: 'user.dev',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Dev',
      roles: ['user']
    }
  };

  async init(): Promise<boolean> {
    console.log('🚀 Using Mock Auth in dev mode');
    return Promise.resolve(true);
  }

  async login(): Promise<void> {
    // Default login as "user"
    this.setMockUser('user');
  }

  async logout(): Promise<void> {
    this.authenticated.set(false);
    this.userProfile.set(null);
    this.roles.set([]);
    console.log('🚪 Mock logout successful');
  }

  async getToken(): Promise<string> {
    // Fake JWT payload
    const payload = {
      sub: this.userProfile()?.username,
      preferred_username: this.userProfile()?.username,
      email: this.userProfile()?.email,
      realm_access: { roles: this.roles() }
    };

    return Promise.resolve(
      'ey.fake.' + btoa(JSON.stringify(payload)) + '.sig'
    );
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  // 🆕 Switch mock users at runtime
  setMockUser(userKey: keyof typeof this.mockUsers) {
    const user = this.mockUsers[userKey];
    if (!user) return;

    this.authenticated.set(true);
    this.userProfile.set(user);
    this.roles.set(user.roles);

    console.log(`✅ Mock login as ${user.username} with roles:`, user.roles);
  }

  // Optional: expose list of mock users for dropdown
  getAvailableMockUsers(): string[] {
    return Object.keys(this.mockUsers);
  }
}