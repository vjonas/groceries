import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../../services/shop.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';
import { EditGroceryComponent } from './edit-grocery/edit-grocery.component';

@Component({
  selector: 'app-groceries',
  standalone: true,
  imports: [CommonModule, FormsModule, EditGroceryComponent],
  template: `
    <section class="section-content">
      <h2>Groceries</h2>
      <form (ngSubmit)="addGrocery()" #groceryForm="ngForm" class="input-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            [(ngModel)]="newGrocery.name"
            required
            class="form-control">
        </div>

        <div class="form-group">
          <label for="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            [(ngModel)]="newGrocery.price"
            required
            step="0.01"
            min="0"
            class="form-control">
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            [(ngModel)]="newGrocery.category"
            required
            class="form-control">
        </div>

        <div class="form-group">
          <label for="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            [(ngModel)]="newGrocery.stock"
            required
            min="0"
            class="form-control">
        </div>

        <button type="submit" class="btn btn-success" [disabled]="!groceryForm.form.valid">
          Add Grocery Item
        </button>
      </form>

      <div class="groceries-grid">
        <div *ngFor="let product of products$ | async" class="card">
          <div class="card-header">
            <h4>{{ product.name }}</h4>
            <p>{{ product.price | currency }}</p>
          </div>
          <div class="card-body">
            <p>Category: {{ product.category }}</p>
            <p>Stock: {{ product.stock }}</p>
            <div class="tags-list">
              <span 
                *ngFor="let tag of product.tags" 
                class="tag-badge"
                [style.background-color]="tag.color">
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button 
              class="btn btn-primary"
              (click)="editProduct(product)">
              Edit
            </button>
          </div>
        </div>
      </div>
    </section>

    <app-edit-grocery
      *ngIf="editingProduct"
      [product]="editingProduct"
      (closeModal)="closeEditModal()"
      (saveChanges)="saveProductChanges($event)">
    </app-edit-grocery>
  `,
  styles: [`
    .section-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .input-form {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
    }

    .groceries-grid {
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

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      color: white;
      margin: 0.25rem;
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
export class GroceriesComponent {
  products$: Observable<Product[]>;
  newGrocery: Partial<Product> = {
    name: '',
    price: 0,
    category: '',
    stock: 0
  };
  editingProduct: Product | null = null;

  constructor(private shopService: ShopService) {
    this.products$ = this.shopService.getProducts();
  }

  async addGrocery() {
    try {
      await this.shopService.addGrocery(this.newGrocery);
      this.newGrocery = {
        name: '',
        price: 0,
        category: '',
        stock: 0
      };
    } catch (error: any) {
      console.error('Error adding grocery:', error);
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
  }

  closeEditModal() {
    this.editingProduct = null;
  }

  async saveProductChanges(changes: {product: Product, addedTags: number[], removedTags: number[]}) {
    try {
      await this.shopService.updateProduct(changes.product);
      
      // Handle tag changes
      for (const tagId of changes.addedTags) {
        await this.shopService.addTagToGrocery(changes.product.id, tagId);
      }
      
      for (const tagId of changes.removedTags) {
        await this.shopService.removeTagFromGrocery(changes.product.id, tagId);
      }
      
      this.closeEditModal();
    } catch (error: any) {
      console.error('Error updating product:', error);
    }
  }
}