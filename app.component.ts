import { Component, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { MockUserSwitcherComponent } from './mock-user-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MockUserSwitcherComponent],
  template: `
    <app-mock-user-switcher *ngIf="isMockAuth"></app-mock-user-switcher>

    <div *ngIf="auth.authenticated(); else loginBlock">
      <h2>Welcome {{ auth.userProfile()?.username }}</h2>
      <p>Your roles: {{ auth.roles().join(', ') }}</p>
      <button (click)="auth.logout()">Logout</button>
    </div>

    <ng-template #loginBlock>
      <h2>Please log in</h2>
      <button (click)="auth.login()">Login</button>
    </ng-template>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  isMockAuth = environment.useMockAuth;
}