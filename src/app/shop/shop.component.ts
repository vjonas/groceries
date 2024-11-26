import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../services/shop.service';
import { Product, Order } from '../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Grocery Shop</h2>
    
    <div class="product-grid">
      <div *ngFor="let product of products$ | async" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>Price: {{ product.price }}</p>
        <p>Stock: {{ product.stock }}</p>
        <button class="btn btn-primary" (click)="addToCart(product)">
          Add to Cart
        </button>
      </div>
    </div>

    <div *ngIf="(cart$ | async)?.length" class="cart-section">
      <h3>Shopping Cart</h3>
      <div *ngFor="let order of cart$ | async">
        <div *ngFor="let item of order.products">
          <p>
            {{ getProductName(item.productId) }} - 
            Quantity: {{ item.quantity }} - 
            {{ item.price * item.quantity }}
          </p>
        </div>
      </div>
      <button class="btn btn-success" (click)="checkout()">
        Checkout
      </button>
    </div>
  `
})
export class ShopComponent implements OnInit {
  products$: Observable<Product[]>;
  cart$: Observable<Order[]>;
  private products: Product[] = [];

  constructor(private shopService: ShopService) {
    this.products$ = this.shopService.getProducts();
    this.cart$ = this.shopService.getCart();
  }

  ngOnInit() {
    this.products$.subscribe(products => this.products = products);
  }

  addToCart(product: Product) {
    this.shopService.addToCart(product);
  }

  checkout() {
    this.shopService.placeOrder();
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.name || '';
  }
}