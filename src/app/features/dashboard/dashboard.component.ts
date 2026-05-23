import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { InventoryService } from '../../core/services/inventory.service';
import { InventoryTransaction } from '../../core/models/inventory.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { TransactionTypePipe } from '../../shared/pipes/transaction-type.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    LoadingSpinnerComponent,
    TransactionTypePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productService = inject(ProductService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly inventoryService = inject(InventoryService);

  readonly totalProducts = signal(0);
  readonly totalWarehouses = signal(0);
  readonly todayInCount = signal(0);
  readonly todayOutCount = signal(0);
  readonly recentTx = signal<InventoryTransaction[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly displayedColumns: readonly string[] = ['createdAtUtc', 'type', 'productName', 'warehouseName', 'quantity'];

  ngOnInit(): void {
    forkJoin({
      products: this.productService.getAll(1, 1).pipe(
        catchError(() =>
          of({
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }),
        ),
      ),
      warehouses: this.warehouseService.getAll().pipe(catchError(() => of([]))),
      history: this.inventoryService.getHistory(1, 50).pipe(
        catchError(() => {
          this.errorMessage.set('Some dashboard data could not be loaded.');
          return of({
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 50,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }),
      ),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ products, warehouses, history }) => {
        this.totalProducts.set(products.totalCount);
        this.totalWarehouses.set(warehouses.length);
        const items = history.items ?? [];
        this.recentTx.set(items.slice(0, 10));

        const today = new Date();
        const isToday = (iso: string): boolean => {
          const d = new Date(iso);
          return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          );
        };

        this.todayInCount.set(items.filter((x) => x.type === 'In' && isToday(x.createdAtUtc)).length);
        this.todayOutCount.set(items.filter((x) => x.type === 'Out' && isToday(x.createdAtUtc)).length);
      });
  }

  typeLabel(type: InventoryTransaction['type']): string {
    return type === 'In' ? 'Stock In' : 'Stock Out';
  }

  typeIcon(type: InventoryTransaction['type']): string {
    return type === 'In' ? 'arrow_upward' : 'arrow_downward';
  }

  relativeFromNow(iso: string): string {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}
