// auth-callback.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      @if (processing()) {
        <p>Completing login...</p>
      }
      @if (error()) {
        <p class="error">Error: {{ error() }}</p>
        <button (click)="retry()">Try Again</button>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .error {
      color: red;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  processing = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.processCallback(fragment);
      } else {
        this.error.set('No authentication data received');
        this.processing.set(false);
      }
    });
  }

  private processCallback(fragment: string): void {
    try {
      const params = new URLSearchParams(fragment);
      const token = params.get('access_token');
      
      if (token) {
        const userData = this.parseToken(token);
        this.authService.handleSSOCallback(token, userData);
      } else {
        this.error.set('No access token received');
        this.processing.set(false);
      }
    } catch (err) {
      this.error.set('Failed to process authentication');
      this.processing.set(false);
    }
  }

  private parseToken(token: string): any {
    // Simple token parsing - in real apps, use jwt-decode or similar
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return { name: 'User', email: 'user@example.com' };
    }
  }

  retry(): void {
    this.authService.loginWithSSO();
  }
}