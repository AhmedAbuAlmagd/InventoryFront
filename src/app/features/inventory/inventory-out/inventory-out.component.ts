import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { Product } from '../../../core/models/product.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { InventoryOutRequest } from '../../../core/models/inventory.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type FieldErrors = Record<string, string[] | string>;

function tryGetMessage(err: HttpErrorResponse): string | null {
  const body = err.error as Partial<ApiResponse<unknown>> | null;
  const msg = body?.error?.message;
  return typeof msg === 'string' && msg.trim() ? msg : null;
}

function tryExtractFieldErrors(err: HttpErrorResponse): FieldErrors | null {
  const body = err.error as Partial<ApiResponse<unknown>> | null;
  const details = body?.error?.details;
  if (!details || typeof details !== 'object') return null;

  const detailsObj = details as Record<string, unknown>;
  const errorsCandidate = detailsObj['errors'];

  const asFieldErrors = (value: unknown): FieldErrors | null => {
    if (!value || typeof value !== 'object') return null;
    const rec = value as Record<string, unknown>;
    const out: FieldErrors = {};
    for (const [k, v] of Object.entries(rec)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v as string[];
      else if (typeof v === 'string') out[k] = v;
    }
    return Object.keys(out).length ? out : null;
  };

  return asFieldErrors(errorsCandidate) ?? asFieldErrors(details);
}

function tryParseInsufficientStock(message: string): { available: number; requested: number } | null {
  const match = /Available:\s*(\d+),\s*Requested:\s*(\d+)/i.exec(message);
  if (!match) return null;
  return { available: Number(match[1]), requested: Number(match[2]) };
}

@Component({
  selector: 'app-inventory-out',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './inventory-out.component.html',
  styleUrl: './inventory-out.component.scss',
})
export class InventoryOutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly inventoryService = inject(InventoryService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);

  readonly form = this.fb.group({
    productId: [null as number | null, [Validators.required]],
    warehouseId: [null as number | null, [Validators.required]],
    quantity: [null as number | null, [Validators.required, CustomValidators.positiveNumber()]],
    notes: ['' as string | null, [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    forkJoin({
      warehouses: this.warehouseService.getAll(),
      products: this.productService.getAll(1, 100, {}),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ warehouses, products }) => {
        this.warehouses.set(warehouses);
        this.products.set(products.items);
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.clearApiErrors();
    this.isSaving.set(true);
    const value = this.form.getRawValue() as InventoryOutRequest;

    this.inventoryService
      .addOut(value)
      .pipe(finalize(() => this.isSaving.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/inventory/history']),
        error: (err: HttpErrorResponse) => {
          if (err.status !== 400) return;

          const msg = tryGetMessage(err);
          if (!msg) {
            const fieldErrors = tryExtractFieldErrors(err);
            if (fieldErrors) {
              this.applyFieldErrors(fieldErrors);
              this.form.markAllAsTouched();
            }
            return;
          }

          if (msg.toLowerCase().includes('insufficient stock')) {
            const parsed = tryParseInsufficientStock(msg);
            this.form.controls.quantity.setErrors({ insufficientStock: parsed ?? true });
            this.form.controls.quantity.markAsTouched();
            return;
          }

          const fieldErrors = tryExtractFieldErrors(err);
          if (fieldErrors) {
            this.applyFieldErrors(fieldErrors);
            this.form.markAllAsTouched();
            return;
          }

          this.errorMessage.set(msg);
        },
      });
  }

  apiError(controlName: 'productId' | 'warehouseId' | 'quantity' | 'notes'): string | null {
    const err = this.form.controls[controlName].getError('api');
    return typeof err === 'string' && err.trim() ? err : null;
  }

  insufficientStockMessage(): string {
    const err = this.form.controls.quantity.getError('insufficientStock') as
      | { available: number; requested: number }
      | true
      | null
      | undefined;

    if (!err) return '';
    if (err === true) return 'Insufficient stock';
    return `Insufficient stock (available: ${err.available}, requested: ${err.requested})`;
  }

  private clearApiErrors(): void {
    for (const controlName of ['productId', 'warehouseId', 'quantity', 'notes'] as const) {
      const control = this.form.controls[controlName];
      if (!control.errors || !('api' in control.errors)) continue;
      const { api: _api, ...rest } = control.errors;
      control.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  private applyFieldErrors(errors: FieldErrors): void {
    const mapKeyToControl: Record<string, 'productId' | 'warehouseId' | 'quantity' | 'notes'> = {
      productid: 'productId',
      warehouseid: 'warehouseId',
      quantity: 'quantity',
      notes: 'notes',
    };

    const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const [rawKey, rawValue] of Object.entries(errors)) {
      const key = normalizeKey(rawKey);
      const controlName = mapKeyToControl[key];
      if (!controlName) continue;

      const message = Array.isArray(rawValue) ? rawValue.filter((x) => x.trim()).join(' ') : rawValue;
      if (!message.trim()) continue;

      const control = this.form.controls[controlName];
      control.setErrors({ ...(control.errors ?? {}), api: message });
    }
  }
}
