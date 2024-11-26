import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './components/orders/orders.component';
import { TagsComponent } from './components/tags/tags.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { GroceriesComponent } from './components/groceries/groceries.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    OrdersComponent,
    TagsComponent,
    SuppliersComponent,
    GroceriesComponent
  ],
  template: `
    <div class="admin-container">
      <nav class="admin-nav">
        <button 
          *ngFor="let tab of tabs" 
          (click)="activeTab = tab.id"
          [class.active]="activeTab === tab.id"
          class="nav-button">
          {{ tab.label }}
        </button>
      </nav>

      <div class="admin-content">
        <app-orders *ngIf="activeTab === 'orders'"></app-orders>
        <app-tags *ngIf="activeTab === 'tags'"></app-tags>
        <app-suppliers *ngIf="activeTab === 'suppliers'"></app-suppliers>
        <app-groceries *ngIf="activeTab === 'groceries'"></app-groceries>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }

    .admin-nav {
      width: 200px;
      background: #2d3748;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: white;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .nav-button:hover {
      background: #4a5568;
    }

    .nav-button.active {
      background: #4299e1;
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      background: #f7fafc;
    }
  `]
})
export class AdminComponent {
  activeTab: 'orders' | 'tags' | 'suppliers' | 'groceries' = 'groceries';
  tabs: { id: 'orders' | 'tags' | 'suppliers' | 'groceries', label: string }[] = [
    { id: 'orders', label: 'Orders' },
    { id: 'tags', label: 'Tags' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'groceries', label: 'Groceries' }
  ];
}