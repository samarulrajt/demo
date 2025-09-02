import { Component, inject } from '@angular/core';
import { MockAuthService } from './mock-auth.service';

@Component({
  standalone: true,
  selector: 'app-mock-user-switcher',
  template: `
    <div style="margin: 1rem; padding: 1rem; border: 1px dashed gray;" *ngIf="isDev">
      <h3>🧪 Mock User Switcher</h3>
      <select (change)="switchUser($event.target.value)">
        <option value="" disabled selected>-- Select Mock User --</option>
        <option *ngFor="let user of users" [value]="user">{{ user }}</option>
      </select>
    </div>
  `
})
export class MockUserSwitcherComponent {
  private auth = inject(MockAuthService);
  users = this.auth.getAvailableMockUsers();
  isDev = !window.location.hostname.includes('prod'); // crude check, or use environment flag

  switchUser(user: string) {
    this.auth.setMockUser(user as any);
  }
}