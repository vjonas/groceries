import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
        <h2>Login</h2>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            [(ngModel)]="email"
            required
            class="form-control">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="password"
            required
            class="form-control">
        </div>

        <button type="submit" class="btn btn-primary">Login</button>
        
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    .login-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .error-message {
      color: red;
      margin-top: 1rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data: { session } } = await this.supabaseService.getSession();
    if (session) {
      await this.router.navigate(['/']);
    }
  }

  async onSubmit() {
    try {
      const { error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) throw error;
      await this.router.navigate(['/']);
    } catch (error: any) {
      this.error = error.message;
    }
  }
}