import { Component, EventEmitter, Input, Output,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, Tag } from '../../../../models/product.model';
import { ShopService } from '../../../../services/shop.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-grocery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit {{ product.name }}</h3>
          <button class="close-button" (click)="close()">×</button>
        </div>

        <form (ngSubmit)="save()" #editForm="ngForm" class="edit-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="editedProduct.name"
              required
              class="form-control">
          </div>

          <div class="form-group">
            <label for="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              [(ngModel)]="editedProduct.price"
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
              [(ngModel)]="editedProduct.category"
              required
              class="form-control">
          </div>

          <div class="form-group">
            <label for="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              [(ngModel)]="editedProduct.stock"
              required
              min="0"
              class="form-control">
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tags-container">
              <div *ngFor="let tag of availableTags$ | async" class="tag-item">
                <label [style.color]="tag.color">
                  <input
                    type="checkbox"
                    [checked]="isTagSelected(tag)"
                    (change)="toggleTag(tag)">
                  {{ tag.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="close()" [disabled]="isSaving()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!editForm.form.valid || isSaving()">
              {{isSaving()}}<span class="spinner" *ngIf="isSaving()"></span>
              <span>{{ isSaving() ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      line-height: 1;
    }

    .edit-form {
      padding: 1.5rem;
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

    .tags-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
    }

    .tag-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tag-item label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #4299e1;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #3182ce;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #cbd5e0;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class EditGroceryComponent {
  @Input() product!: Product;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<{product: Product, addedTags: number[], removedTags: number[]}>();

  editedProduct: Product = {} as Product;
  availableTags$: Observable<Tag[]>;
  selectedTagIds: Set<number>;
  isSaving=signal(false);

  constructor(private shopService: ShopService) {
    this.availableTags$ = this.shopService.getTags();
    this.selectedTagIds = new Set();
  }

  ngOnInit() {
    // Create a copy of the product for editing
    this.editedProduct = { ...this.product };
    // Initialize selected tags
    this.selectedTagIds = new Set(this.product.tags?.map(tag => tag.id) || []);
  }

  isTagSelected(tag: Tag): boolean {
    return this.selectedTagIds.has(tag.id);
  }

  toggleTag(tag: Tag) {
    if (this.selectedTagIds.has(tag.id)) {
      this.selectedTagIds.delete(tag.id);
    } else {
      this.selectedTagIds.add(tag.id);
    }
  }

  close() {
    if (!this.isSaving()) {
      this.closeModal.emit();
    }
  }

  async save() {
    this.isSaving.set(true);
    
      const currentTagIds = new Set(this.product.tags?.map(tag => tag.id) || []);
      const newTagIds = new Set(this.selectedTagIds);

      // Find added and removed tags
      const addedTags = Array.from(newTagIds).filter(id => !currentTagIds.has(id));
      const removedTags = Array.from(currentTagIds).filter(id => !newTagIds.has(id));

      this.saveChanges.emit({
        product: this.editedProduct,
        addedTags,
        removedTags
      });
      this.isSaving.set(false);
    
  }
}