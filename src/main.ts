import { bootstrapApplication } from '@angular/platform-browser';
import { Routes, provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthGuard } from './app/guards/auth.guard';
import { withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./app/shop/shop.component').then(m => m.ShopComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => 
      import('./app/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => 
      import('./app/components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./app/components/login/login.component').then(m => m.LoginComponent)
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations()
  ]
}).catch(err => console.error(err));