import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';
import { MigrationService } from './services/migration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Shop</a>
        <a routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-link" *ngIf="isLoggedIn">Settings</a>
      </nav>
    </header>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .header {
      background-color: #f8f9fa;
      padding: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    nav {
      display: flex;
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .nav-link {
      color: #333;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      background-color: #e9ecef;
    }
    
    .nav-link.active {
      background-color: #007bff;
      color: white;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private supabaseService: SupabaseService,
    private migrationService: MigrationService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data: { user } } = await this.supabaseService.getUser();
    this.isLoggedIn = !!user;

    // Run initial migration
   
  }
}