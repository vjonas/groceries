import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../services/shop.service';
import { Order } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-content">
      <h2>Orders</h2>
      <div *ngFor="let order of orders$ | async" class="card">
        <div class="card-header">
          <p>Order #{{ order.id }}</p>
          <p>User: {{ order.userEmail }}</p>
          <p>Total: {{ order.totalAmount | currency }}</p>
          <p>Status: {{ order.status }}</p>
          <p>Date: {{ order.createdAt | date:'medium' }}</p>
        </div>
        <div class="card-body">
          <h4>Order Items</h4>
          <div *ngFor="let item of order.products" class="order-item">
            <p>{{ getProductName(item.productId) }}</p>
            <p>Quantity: {{ item.quantity }}</p>
            <p>Price: {{ item.price | currency }}</p>
          </div>
        </div>
        <div class="card-actions">
          <button 
            class="btn btn-primary"
            (click)="updateStatus(order.id, 'processing')"
            [disabled]="order.status === 'processing'">
            Mark Processing
          </button>
          <button 
            class="btn btn-success"
            (click)="updateStatus(order.id, 'completed')"
            [disabled]="order.status === 'completed'">
            Mark Completed
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

    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-header {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-body {
      margin: 1rem 0;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
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

    .btn-success {
      background: #48bb78;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #38a169;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class OrdersComponent {
  orders$: Observable<Order[]>;

  constructor(private shopService: ShopService) {
    this.orders$ = this.shopService.getOrders();
  }

  updateStatus(orderId: number, status: 'pending' | 'processing' | 'completed') {
    this.shopService.updateOrderStatus(orderId, status);
  }

  getProductName(productId: number): string {
    return this.shopService.getProductName(productId);
  }
}