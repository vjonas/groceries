import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MigrationService } from '../../services/migration.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <div class="settings-card">
        <h2 class="settings-title">Account Settings</h2>
        
        <div class="user-info" *ngIf="userInfo">
          <div class="info-group">
            <label>Email</label>
            <p>{{ userInfo.email }}</p>
          </div>
          
          <div class="info-group">
            <label>Last Sign In</label>
            <p>{{ userInfo.last_sign_in_at | date:'medium' }}</p>
          </div>
          
          <div class="info-group">
            <label>Account Created</label>
            <p>{{ userInfo.created_at | date:'mediumDate' }}</p>
          </div>
        </div>

        <div class="button-group">
          <button (click)="runMigration()" class="migration-button" [disabled]="isMigrating">
            <span class="icon">🔄</span>
            {{ isMigrating ? 'Running Migration...' : 'Run Database Migration' }}
          </button>

          <button (click)="logout()" class="logout-button">
            <span class="logout-icon">⟲</span>
            Sign Out
          </button>
        </div>

        <div *ngIf="migrationError" class="error-message">
          {{ migrationError }}
        </div>
        <div *ngIf="migrationSuccess" class="success-message">
          {{ migrationSuccess }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .settings-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .settings-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #edf2f7;
    }

    .user-info {
      margin-bottom: 2rem;
    }

    .info-group {
      margin-bottom: 1.5rem;
    }

    .info-group label {
      display: block;
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }

    .info-group p {
      font-size: 1rem;
      color: #2d3748;
      font-weight: 500;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .migration-button, .logout-button {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .migration-button {
      background-color: #4299e1;
      color: white;
    }

    .migration-button:hover:not(:disabled) {
      background-color: #3182ce;
    }

    .migration-button:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    .logout-button {
      background-color: #f56565;
      color: white;
    }

    .logout-button:hover {
      background-color: #e53e3e;
    }

    .icon, .logout-icon {
      font-size: 1.25rem;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 4px;
      background-color: #fed7d7;
      color: #c53030;
    }

    .success-message {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 4px;
      background-color: #c6f6d5;
      color: #2f855a;
    }
  `]
})
export class SettingsComponent implements OnInit {
  userInfo: any = null;
  isMigrating = false;
  migrationError = '';
  migrationSuccess = '';

  constructor(
    private supabaseService: SupabaseService,
    private migrationService: MigrationService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data: { user } } = await this.supabaseService.getUser();
    this.userInfo = user;
  }

  async runMigration() {
    this.isMigrating = true;
    this.migrationError = '';
    this.migrationSuccess = '';

    try {
      await this.migrationService.runMigration();
      this.migrationSuccess = 'Database migration completed successfully!';
    } catch (error: any) {
      this.migrationError = error.message || 'Failed to run database migration';
    } finally {
      this.isMigrating = false;
    }
  }

  async logout() {
    await this.supabaseService.signOut();
    await this.router.navigate(['/login']);
  }
}