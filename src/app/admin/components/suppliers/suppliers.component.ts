import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../services/shop.service';
import { Supplier } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-content">
      <h2>Suppliers</h2>
      <div class="suppliers-grid">
        <div *ngFor="let supplier of suppliers$ | async" class="card">
          <h4>{{ supplier.name }}</h4>
          <p>Categories: {{ supplier.categories.join(', ') }}</p>
          <button 
            class="btn btn-primary"
            (click)="orderFromSupplier(supplier)">
            Order Stock
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .section-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .suppliers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #4299e1;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #3182ce;
    }
  `]
})
export class SuppliersComponent {
  suppliers$: Observable<Supplier[]>;

  constructor(private shopService: ShopService) {
    this.suppliers$ = this.shopService.getSuppliers();
  }

  orderFromSupplier(supplier: Supplier) {
    this.shopService.orderFromSupplier(supplier);
  }
}