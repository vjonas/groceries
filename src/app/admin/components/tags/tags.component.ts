import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../../services/shop.service';
import { Tag } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="section-content">
      <h2>Tags</h2>
      <form (ngSubmit)="addTag()" #tagForm="ngForm" class="input-form">
        <div class="form-group">
          <label for="tagName">Name</label>
          <input
            type="text"
            id="tagName"
            name="tagName"
            [(ngModel)]="newTag.name"
            required
            class="form-control">
        </div>

        <div class="form-group">
          <label for="tagColor">Color</label>
          <div class="color-input">
            <input
              type="color"
              id="tagColor"
              name="tagColor"
              [(ngModel)]="newTag.color"
              required
              class="form-control">
            <span class="color-preview">{{ newTag.color }}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="!tagForm.form.valid">
          Add Tag
        </button>
      </form>

      <div class="tags-grid">
        <div *ngFor="let tag of tags$ | async" class="tag-card">
          <div class="tag-color" [style.background-color]="tag.color"></div>
          <div class="tag-info">
            <h4>{{ tag.name }}</h4>
            <p>{{ tag.color }}</p>
          </div>
        </div>
      </div>
    </section>
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

    .color-input {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .color-preview {
      font-family: monospace;
    }

    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .tag-card {
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .tag-color {
      height: 4rem;
    }

    .tag-info {
      padding: 1rem;
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

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class TagsComponent {
  tags$: Observable<Tag[]>;
  newTag: Partial<Tag> = {
    name: '',
    color: '#000000'
  };

  constructor(private shopService: ShopService) {
    this.tags$ = this.shopService.getTags();
  }

  async addTag() {
    try {
      await this.shopService.addTag(this.newTag);
      this.newTag = {
        name: '',
        color: '#000000'
      };
    } catch (error: any) {
      console.error('Error adding tag:', error);
    }
  }
}