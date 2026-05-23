import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryHistoryFilters, InventoryTransaction, TransactionType } from '../../../core/models/inventory.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TransactionTypePipe } from '../../../shared/pipes/transaction-type.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-inventory-history',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    TransactionTypePipe,
    CurrencyPipe,
  ],
  templateUrl: './inventory-history.component.html',
  styleUrl: './inventory-history.component.scss',
})
export class InventoryHistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly inventoryService = inject(InventoryService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);

  readonly transactions = signal<InventoryTransaction[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);

  readonly selectedProductId = signal<number | null>(null);
  readonly selectedWarehouseId = signal<number | null>(null);
  readonly selectedType = signal<TransactionType | null>(null);
  readonly searchTerm = signal('');
  readonly fromUtc = signal<string | null>(null);
  readonly toUtc = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);

  readonly displayedColumns: readonly string[] = [
    'createdAtUtc',
    'type',
    'productName',
    'productSKU',
    'warehouseName',
    'quantity',
    'unitPrice',
    'createdByUsername',
    'notes',
  ];

  readonly datePipe = inject(DatePipe);

  ngOnInit(): void {
    forkJoin({
      warehouses: this.warehouseService.getAll(),
      products: this.productService.getAll(1, 1000, {}),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ warehouses, products }) => {
        this.warehouses.set(warehouses);
        this.products.set(products.items);
      });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.inventoryService
      .getHistory(
        this.currentPage(),
        this.pageSize(),
        this.getFilters(),
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.transactions.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.load();
  }

  clearFilters(): void {
    this.selectedProductId.set(null);
    this.selectedWarehouseId.set(null);
    this.selectedType.set(null);
    this.searchTerm.set('');
    this.fromUtc.set(null);
    this.toUtc.set(null);
    this.currentPage.set(1);
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedProductId() ||
      this.selectedWarehouseId() ||
      this.selectedType() ||
      this.searchTerm().trim() ||
      this.fromUtc() ||
      this.toUtc()
    );
  }

  typeLabel(type: TransactionType): string {
    return type === 'In' ? 'Stock In' : 'Stock Out';
  }

  typeIcon(type: TransactionType): string {
    return type === 'In' ? 'arrow_upward' : 'arrow_downward';
  }

  fullDate(value: string): string {
    return this.datePipe.transform(value, 'medium') ?? value;
  }

  private getFilters(): InventoryHistoryFilters {
    return {
      productId: this.selectedProductId(),
      warehouseId: this.selectedWarehouseId(),
      type: this.selectedType(),
      search: this.searchTerm(),
      fromUtc: this.fromUtc(),
      toUtc: this.toUtc(),
    };
  }
}
