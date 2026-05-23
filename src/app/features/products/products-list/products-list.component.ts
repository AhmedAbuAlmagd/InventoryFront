import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, filter, forkJoin, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilters } from '../../../core/models/product.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    PageHeaderComponent,
    SearchBarComponent,
    LoadingSpinnerComponent,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productService = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedStatus = signal<boolean | null>(null);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly categories = signal<string[]>([]);

  readonly displayedColumns = computed(() =>
    this.auth.isAdmin() ? ['sku', 'name', 'category', 'price', 'isActive', 'actions'] : ['sku', 'name', 'category', 'price', 'isActive'],
  );

  ngOnInit(): void {
    forkJoin({
      categories: this.productService.getAll(1, 1000, {}),
      current: this.productService.getAll(this.currentPage(), this.pageSize(), this.getFilters()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ categories, current }) => {
        this.categories.set(
          [...new Set(categories.items.map((x) => x.category?.trim()).filter((x): x is string => !!x))].sort((a, b) =>
            a.localeCompare(b),
          ),
        );
        this.products.set(current.items);
        this.totalCount.set(current.totalCount);
      });
  }

  load(): void {
    this.isLoading.set(true);
    this.productService
      .getAll(this.currentPage(), this.pageSize(), this.getFilters())
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.load();
  }

  onFiltersChange(): void {
    this.currentPage.set(1);
    this.load();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.selectedStatus.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.currentPage.set(1);
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  confirmDelete(product: Product): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
      },
    });

    ref
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.productService.delete(product.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully.', 'Close', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 }),
      });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm().trim() ||
      this.selectedCategory() ||
      this.selectedStatus() !== null ||
      this.minPrice() !== null ||
      this.maxPrice() !== null
    );
  }

  private getFilters(): ProductFilters {
    return {
      search: this.searchTerm(),
      category: this.selectedCategory(),
      isActive: this.selectedStatus(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
    };
  }
}
