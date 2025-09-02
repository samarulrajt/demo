import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-forbidden',
  template: `
    <h2>🚫 Access Denied</h2>
    <p>You do not have the required permissions to view this page.</p>
  `
})
export class ForbiddenComponent {}