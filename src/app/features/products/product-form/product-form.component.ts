import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize, map, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { CreateProductRequest, UpdateProductRequest } from '../../../core/models/product.model';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  @Input() id?: string;

  private readonly destroyRef = inject(DestroyRef);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly isEditMode = computed(() => !!this.id);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly categories = signal<string[]>([]);
  filteredCategories!: Observable<string[]>;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    sku: ['', [Validators.required, Validators.maxLength(50), CustomValidators.skuPattern()]],
    description: ['' as string | null, [Validators.maxLength(1000)]],
    price: [null as number | null, [Validators.required, CustomValidators.positiveNumber()]],
    category: ['' as string | null, [Validators.maxLength(100)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadCategories();

    this.filteredCategories = this.form.controls.category.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    if (!this.isEditMode()) return;

    this.isLoading.set(true);
    this.productService
      .getById(Number(this.id))
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.form.patchValue({
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: product.price,
            category: product.category,
            isActive: product.isActive,
          });
          this.form.controls.sku.disable();
        },
        error: () => void this.router.navigate(['/products']),
      });
  }

  private loadCategories(): void {
    this.productService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories.set(categories));
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categories().filter((option) => option.toLowerCase().includes(filterValue));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.form.getRawValue();

    const request$ = this.isEditMode()
      ? this.productService.update(Number(this.id), value as UpdateProductRequest)
      : this.productService.create(value as CreateProductRequest);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(this.isEditMode() ? 'Product updated.' : 'Product created.', 'Close', { duration: 3000 });
          void this.router.navigate(['/products']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409 && !this.isEditMode()) {
            this.form.controls.sku.setErrors({ duplicate: true });
          }
        },
      });
  }

  cancel(): void {
    void this.router.navigate(['/products']);
  }
}
