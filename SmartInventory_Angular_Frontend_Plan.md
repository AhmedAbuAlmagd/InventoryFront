# Smart Inventory Management System — Angular Frontend Implementation Plan

> **Stack:** Angular 18 (Standalone Components) · TypeScript · Angular Material  
> **Backend:** ASP.NET Core 9 API at `http://localhost:8080`  
> **Auth:** JWT (stored in memory + HttpOnly cookie strategy — see Security section)  
> **Bonus:** Pagination · Search · Dark Mode  

---

## 1. Angular Version & Key Decisions
  
| Decision | Choice | Reason |
|---|---|---|
| Angular version | **18** | Latest stable, signals available |
| Component model | **Standalone** (no NgModules) | Less boilerplate, modern Angular style |
| UI library | **Angular Material 18** | Consistent, accessible, ships with CDK |
| State management | **Angular Signals + Services** | No NgRx needed at this scale |
| Forms | **Reactive Forms** | Required for proper validation UX |
| HTTP | **HttpClient + Interceptors** | JWT injection, error handling |
| CSS | **SCSS + CSS custom properties** | Theming, dark mode |
| Routing | **Lazy-loaded routes** | Performance, code splitting |
| HTTP guards | **Functional route guards** | Modern Angular, no class boilerplate |

---

## 2. Folder Structure

```
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors — imported once
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── role.guard.ts
│   │   │   └── auth.models.ts        # LoginRequest, LoginResponse, UserInfo interfaces
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts   # Attaches JWT to every request
│   │   │   └── error.interceptor.ts  # Global HTTP error → toast
│   │   ├── models/                   # All TypeScript interfaces matching backend DTOs
│   │   │   ├── product.model.ts
│   │   │   ├── warehouse.model.ts
│   │   │   ├── inventory.model.ts
│   │   │   └── pagination.model.ts
│   │   └── services/                 # HTTP services — one per resource
│   │       ├── product.service.ts
│   │       ├── warehouse.service.ts
│   │       └── inventory.service.ts
│   │
│   ├── shared/                        # Reusable dumb components, pipes, directives
│   │   ├── components/
│   │   │   ├── confirm-dialog/
│   │   │   │   ├── confirm-dialog.component.ts
│   │   │   │   └── confirm-dialog.component.html
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.component.ts
│   │   │   │   └── data-table.component.html
│   │   │   ├── page-header/
│   │   │   │   ├── page-header.component.ts
│   │   │   │   └── page-header.component.html
│   │   │   ├── search-bar/
│   │   │   │   ├── search-bar.component.ts
│   │   │   │   └── search-bar.component.html
│   │   │   └── loading-spinner/
│   │   │       └── loading-spinner.component.ts
│   │   ├── pipes/
│   │   │   └── transaction-type.pipe.ts   # "In" → "Stock In", "Out" → "Stock Out"
│   │   └── validators/
│   │       └── custom-validators.ts       # shared form validators
│   │
│   ├── layout/                            # App shell (authenticated layout)
│   │   ├── layout.component.ts
│   │   ├── layout.component.html
│   │   ├── layout.component.scss
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   └── sidebar.component.html
│   │   └── topbar/
│   │       ├── topbar.component.ts
│   │       └── topbar.component.html
│   │
│   ├── features/                          # Lazy-loaded feature modules
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   │   ├── dashboard.component.scss
│   │   │   ├── components/
│   │   │   │   ├── stat-card/
│   │   │   │   └── recent-transactions/
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── products/
│   │   │   ├── products-list/
│   │   │   │   ├── products-list.component.ts
│   │   │   │   ├── products-list.component.html
│   │   │   │   └── products-list.component.scss
│   │   │   ├── product-form/
│   │   │   │   ├── product-form.component.ts     # Used for both Add and Edit
│   │   │   │   ├── product-form.component.html
│   │   │   │   └── product-form.component.scss
│   │   │   └── products.routes.ts
│   │   │
│   │   └── inventory/
│   │       ├── inventory-history/
│   │       │   ├── inventory-history.component.ts
│   │       │   ├── inventory-history.component.html
│   │       │   └── inventory-history.component.scss
│   │       ├── inventory-in/
│   │       │   ├── inventory-in.component.ts
│   │       │   └── inventory-in.component.html
│   │       ├── inventory-out/
│   │       │   ├── inventory-out.component.ts
│   │       │   └── inventory-out.component.html
│   │       └── inventory.routes.ts
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.config.ts                      # provideRouter, provideHttpClient, etc.
│   └── app.routes.ts                      # Root lazy routes
│
├── environments/
│   ├── environment.ts                     # { apiUrl: 'http://localhost:8080' }
│   └── environment.prod.ts
│
├── styles/
│   ├── _variables.scss                    # CSS custom properties, breakpoints
│   ├── _typography.scss
│   ├── _mixins.scss
│   └── _themes.scss                       # Light/dark theme tokens
│
└── styles.scss                            # Global imports
```

---

## 3. TypeScript Models (mirrors backend DTOs exactly)

```typescript
// core/models/pagination.model.ts
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// core/models/product.model.ts
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;   // ISO string — format with DatePipe in template
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description: string | null;
  price: number;
  category: string | null;
}

export interface UpdateProductRequest {
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  isActive: boolean;
}

// core/models/warehouse.model.ts
export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  location: string | null;
}

// core/models/inventory.model.ts
export type TransactionType = 'In' | 'Out';

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  warehouseId: number;
  warehouseName: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  notes: string | null;
  createdByUsername: string;
  createdAt: string;
}

export interface InventoryInRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  unitPrice: number;
  notes: string | null;
}

export interface InventoryOutRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  notes: string | null;
}

// core/auth/auth.models.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: 'Admin' | 'Employee';
  expiresAt: string;
}

export interface UserInfo {
  username: string;
  role: 'Admin' | 'Employee';
  expiresAt: string;
}
```

---

## 4. App Bootstrap — `app.config.ts`

```typescript
// app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
  ],
};
```

---

## 5. Routing

```typescript
// app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(c => c.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(r => r.DASHBOARD_ROUTES),
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(r => r.PRODUCTS_ROUTES),
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then(r => r.INVENTORY_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];

// features/auth/auth.routes.ts
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

// features/products/products.routes.ts
import { roleGuard } from '../../core/auth/role.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list/products-list.component')
      .then(c => c.ProductsListComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./product-form/product-form.component')
      .then(c => c.ProductFormComponent),
    canActivate: [roleGuard(['Admin'])],
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form.component')
      .then(c => c.ProductFormComponent),
    canActivate: [roleGuard(['Admin'])],
  },
];

// features/inventory/inventory.routes.ts
export const INVENTORY_ROUTES: Routes = [
  {
    path: 'history',
    loadComponent: () => import('./inventory-history/inventory-history.component')
      .then(c => c.InventoryHistoryComponent),
  },
  {
    path: 'in',
    loadComponent: () => import('./inventory-in/inventory-in.component')
      .then(c => c.InventoryInComponent),
  },
  {
    path: 'out',
    loadComponent: () => import('./inventory-out/inventory-out.component')
      .then(c => c.InventoryOutComponent),
  },
];
```

---

## 6. Core: Auth Service

```typescript
// core/auth/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Signals ──────────────────────────────────────────────────────────────
  // Token is stored ONLY in memory (never localStorage — see Security section)
  private _token = signal<string | null>(null);
  private _user  = signal<UserInfo | null>(null);

  readonly token    = this._token.asReadonly();
  readonly user     = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);
  readonly isAdmin    = computed(() => this._user()?.role === 'Admin');

  // ── Methods ───────────────────────────────────────────────────────────────
  login(request: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, request).pipe(
      tap(response => {
        this._token.set(response.token);
        this._user.set({
          username: response.username,
          role: response.role,
          expiresAt: response.expiresAt,
        });
        // Schedule auto-logout at token expiry
        const expiresIn = new Date(response.expiresAt).getTime() - Date.now();
        setTimeout(() => this.logout(), expiresIn);
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(roles: string[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }
}
```

---

## 7. Core: Guards

```typescript
// core/auth/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/auth/login']);
};

// core/auth/role.guard.ts
// Factory function — accepts the allowed roles as parameter
export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  if (!auth.hasRole(roles)) return router.createUrlTree(['/dashboard']);  // redirect, not 403 page
  return true;
};
```

---

## 8. Core: Interceptors

```typescript
// core/interceptors/auth.interceptor.ts
// Functional interceptor — attaches Bearer token to every outgoing request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};

// core/interceptors/error.interceptor.ts
// Catches HTTP errors globally and shows a snack bar
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const auth     = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          break;
        case 403:
          snackBar.open('You do not have permission to perform this action.', 'Close', { duration: 4000 });
          break;
        case 404:
          snackBar.open('Resource not found.', 'Close', { duration: 3000 });
          break;
        case 409:
          // Let the component handle conflict errors (e.g. duplicate SKU)
          break;
        case 400:
          // Let the component handle validation errors
          break;
        default:
          snackBar.open('An unexpected error occurred. Please try again.', 'Close', { duration: 4000 });
      }
      return throwError(() => error);
    })
  );
};
```

---

## 9. Core: HTTP Services

```typescript
// core/services/product.service.ts
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/products`;

  getAll(page = 1, pageSize = 10, search?: string): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<PagedResult<Product>>(this.base, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(body: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base, body);
  }

  update(id: number, body: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

// core/services/warehouse.service.ts
@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/warehouses`;

  getAll(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.base);
  }

  create(body: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.base, body);
  }
}

// core/services/inventory.service.ts
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/inventory`;

  addIn(body: InventoryInRequest): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(`${this.base}/in`, body);
  }

  addOut(body: InventoryOutRequest): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(`${this.base}/out`, body);
  }

  getHistory(
    page = 1,
    pageSize = 20,
    productId?: number,
    warehouseId?: number
  ): Observable<PagedResult<InventoryTransaction>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (productId)   params = params.set('productId', productId);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<PagedResult<InventoryTransaction>>(`${this.base}/history`, { params });
  }
}
```

---

## 10. Shared Components

### 10.1 Confirm Dialog

```typescript
// shared/components/confirm-dialog/confirm-dialog.component.ts
// Used for: delete product confirmation
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  readonly data = inject<{ title: string; message: string; confirmLabel?: string }>(MAT_DIALOG_DATA);
}

// Usage in any component:
// const ref = this.dialog.open(ConfirmDialogComponent, {
//   data: { title: 'Delete Product', message: 'This cannot be undone.', confirmLabel: 'Delete' }
// });
// ref.afterClosed().subscribe(confirmed => { if (confirmed) this.doDelete(); });
```

### 10.2 Page Header

```typescript
// shared/components/page-header/page-header.component.ts
// Inputs: title (string), subtitle? (string), actions template slot
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1>{{ title }}</h1>
        @if (subtitle) { <p>{{ subtitle }}</p> }
      </div>
      <div class="page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
```

### 10.3 Search Bar (with debounce)

```typescript
// shared/components/search-bar/search-bar.component.ts
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatInputModule, MatIconModule, ReactiveFormsModule],
  template: `
    <mat-form-field appearance="outline" class="search-bar">
      <mat-label>{{ placeholder }}</mat-label>
      <input matInput [formControl]="searchControl" />
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>
  `
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Output() searched = new EventEmitter<string>();

  readonly searchControl = new FormControl('');
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => this.searched.emit(value ?? ''));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
```

### 10.4 Loading Spinner

```typescript
// shared/components/loading-spinner/loading-spinner.component.ts
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay">
      <mat-spinner diameter="48" />
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
    }
  `]
})
export class LoadingSpinnerComponent {}
```

### 10.5 Transaction Type Pipe

```typescript
// shared/pipes/transaction-type.pipe.ts
@Pipe({ name: 'transactionType', standalone: true, pure: true })
export class TransactionTypePipe implements PipeTransform {
  transform(value: TransactionType): string {
    return value === 'In' ? 'Stock In' : 'Stock Out';
  }
}
```

### 10.6 Custom Validators

```typescript
// shared/validators/custom-validators.ts
export class CustomValidators {
  // Validates SKU pattern: letters, numbers, hyphens, underscores only
  static skuPattern(): ValidatorFn {
    return Validators.pattern(/^[A-Za-z0-9\-_]+$/);
  }

  // Min value (for price/quantity — stricter than Validators.min)
  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (val === null || val === '') return null;
      return Number(val) > 0 ? null : { positiveNumber: true };
    };
  }

  // Non-negative (for unit price on stock-in)
  static nonNegative(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (val === null || val === '') return null;
      return Number(val) >= 0 ? null : { nonNegative: true };
    };
  }
}
```

---

## 11. Feature: Login Page

```typescript
// features/auth/login/login.component.ts
@Component({ selector: 'app-login', standalone: true, ... })
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed field-level error helpers — used directly in template
  readonly usernameError = computed(() => {
    const c = this.form.controls.username;
    if (c.hasError('required') && c.touched) return 'Username is required';
    return null;
  });

  readonly passwordError = computed(() => {
    const c = this.form.controls.password;
    if (c.hasError('required') && c.touched) return 'Password is required';
    if (c.hasError('minlength') && c.touched) return 'Minimum 8 characters';
    return null;
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Invalid username or password.' : 'Login failed. Please try again.'
        );
      },
    });
  }
}
```

**Template rules:**
- Disable submit button when `isLoading()` is true
- Show `mat-error` under each field using the computed error signals
- Show general error banner when `errorMessage()` is not null
- Never show field errors until the field has been touched

---

## 12. Feature: Dashboard

```typescript
// features/dashboard/dashboard.component.ts
@Component({ selector: 'app-dashboard', standalone: true, ... })
export class DashboardComponent implements OnInit {
  private readonly productService   = inject(ProductService);
  private readonly inventoryService = inject(InventoryService);
  private readonly warehouseService = inject(WarehouseService);

  // Signals for each stat
  readonly totalProducts   = signal(0);
  readonly totalWarehouses = signal(0);
  readonly recentTx        = signal<InventoryTransaction[]>([]);
  readonly isLoading       = signal(true);

  ngOnInit(): void {
    forkJoin({
      products:   this.productService.getAll(1, 1),
      warehouses: this.warehouseService.getAll(),
      history:    this.inventoryService.getHistory(1, 5),
    }).pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(({ products, warehouses, history }) => {
        this.totalProducts.set(products.totalCount);
        this.totalWarehouses.set(warehouses.length);
        this.recentTx.set(history.items);
      });
  }
}
```

**Dashboard template shows:**
- Stat cards: Total Products, Total Warehouses, Recent Transactions
- A table of the 5 most recent inventory transactions
- Loading spinner while `isLoading()` is true

---

## 13. Feature: Products

### Products List

```typescript
// features/products/products-list/products-list.component.ts
@Component({ selector: 'app-products-list', standalone: true, ... })
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly dialog         = inject(MatDialog);
  private readonly snackBar       = inject(MatSnackBar);
  readonly auth                   = inject(AuthService);

  readonly products     = signal<Product[]>([]);
  readonly totalCount   = signal(0);
  readonly isLoading    = signal(false);
  readonly currentPage  = signal(1);
  readonly pageSize     = signal(10);
  readonly searchTerm   = signal('');

  // Displayed columns — employees cannot see delete column
  readonly displayedColumns = computed(() =>
    this.auth.isAdmin()
      ? ['sku', 'name', 'category', 'price', 'isActive', 'actions']
      : ['sku', 'name', 'category', 'price', 'isActive']
  );

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.productService
      .getAll(this.currentPage(), this.pageSize(), this.searchTerm())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(result => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);   // reset to page 1 on new search
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
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.productService.delete(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully.', 'Close', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 }),
      });
    });
  }
}
```

### Product Form (Add / Edit — single component)

```typescript
// features/products/product-form/product-form.component.ts
// Determines Add vs Edit by presence of route param :id (via withComponentInputBinding)
@Component({ selector: 'app-product-form', standalone: true, ... })
export class ProductFormComponent implements OnInit {
  @Input() id?: string;   // injected from route via withComponentInputBinding()

  private readonly productService = inject(ProductService);
  private readonly router         = inject(Router);
  private readonly snackBar       = inject(MatSnackBar);
  private readonly fb             = inject(FormBuilder);

  readonly isEditMode  = computed(() => !!this.id);
  readonly isLoading   = signal(false);
  readonly isSaving    = signal(false);

  readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(200)]],
    sku:         ['', [Validators.required, Validators.maxLength(50), CustomValidators.skuPattern()]],
    description: ['' as string | null, [Validators.maxLength(1000)]],
    price:       [null as number | null, [Validators.required, CustomValidators.positiveNumber()]],
    category:    ['' as string | null, [Validators.maxLength(100)]],
    isActive:    [true],   // only shown in edit mode
  });

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.isLoading.set(true);
      this.productService.getById(Number(this.id))
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: product => this.form.patchValue(product),
          error: () => this.router.navigate(['/products']),
        });
      // SKU is read-only in edit mode (SKU must not change)
      this.form.controls.sku.disable();
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSaving.set(true);
    const value = this.form.getRawValue();

    const request$ = this.isEditMode()
      ? this.productService.update(Number(this.id), value as UpdateProductRequest)
      : this.productService.create(value as CreateProductRequest);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Product updated.' : 'Product created.',
          'Close', { duration: 3000 }
        );
        this.router.navigate(['/products']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.form.controls.sku.setErrors({ duplicate: true });
        }
      },
    });
  }
}
```

**Template rules for product form:**
- Show `isActive` toggle only when `isEditMode()` is true
- SKU field is disabled (read-only) in edit mode — visual cue with `[readonly]` styling
- All fields show `mat-error` messages on touched + invalid state
- Save button shows a spinner when `isSaving()` is true and is disabled
- Cancel button navigates back to `/products`

---

## 14. Feature: Inventory

### Inventory History

```typescript
// features/inventory/inventory-history/inventory-history.component.ts
@Component({ selector: 'app-inventory-history', standalone: true, ... })
export class InventoryHistoryComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService   = inject(ProductService);

  readonly transactions  = signal<InventoryTransaction[]>([]);
  readonly totalCount    = signal(0);
  readonly isLoading     = signal(false);
  readonly warehouses    = signal<Warehouse[]>([]);
  readonly products      = signal<Product[]>([]);

  // Filter state
  readonly selectedProductId   = signal<number | null>(null);
  readonly selectedWarehouseId = signal<number | null>(null);
  readonly currentPage         = signal(1);
  readonly pageSize            = signal(20);

  readonly displayedColumns = [
    'createdAt', 'type', 'productName', 'productSKU',
    'warehouseName', 'quantity', 'unitPrice', 'createdByUsername', 'notes'
  ];

  ngOnInit(): void {
    // Load filter dropdowns in parallel
    forkJoin({
      warehouses: this.warehouseService.getAll(),
      products:   this.productService.getAll(1, 1000), // load all for filter dropdown
    }).subscribe(({ warehouses, products }) => {
      this.warehouses.set(warehouses);
      this.products.set(products.items);
    });
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.inventoryService
      .getHistory(
        this.currentPage(), this.pageSize(),
        this.selectedProductId() ?? undefined,
        this.selectedWarehouseId() ?? undefined
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(result => {
        this.transactions.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }
}
```

### Inventory In / Out Forms

```typescript
// Both forms share the same structure — only differences noted

// features/inventory/inventory-in/inventory-in.component.ts
// form fields: productId (required), warehouseId (required), quantity (required, >0),
//              unitPrice (required, >=0), notes (optional, max 500)

// features/inventory/inventory-out/inventory-out.component.ts
// form fields: productId (required), warehouseId (required), quantity (required, >0),
//              notes (optional, max 500)
// NOTE: no unitPrice field on stock-out
// On 400 error with message containing "Insufficient stock" → show inline error on quantity field
// Extract available stock from error message for user-friendly display

// Both components:
// - Load warehouses and products via forkJoin on init for dropdowns
// - On success: navigate to /inventory/history
// - On error 400: show inline field error (not just toast)
// - On error 404: error interceptor handles it (product/warehouse deactivated)
```

---

## 15. Layout (App Shell)

```typescript
// layout/layout.component.ts
// The authenticated shell — sidebar + topbar + router-outlet
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, MatSidenavModule],
  template: `
    <mat-sidenav-container>
      <mat-sidenav mode="side" [opened]="sidenavOpen()">
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content>
        <app-topbar (menuToggled)="sidenavOpen.set(!sidenavOpen())" />
        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class LayoutComponent {
  readonly sidenavOpen = signal(true);
}

// layout/sidebar/sidebar.component.ts
// Nav items — visible items depend on role
// All roles see: Dashboard, Products, Inventory History, Stock In, Stock Out
// Admin additionally sees: (nav items with lock icon for restricted routes)
// Use auth.isAdmin() signal to conditionally show admin-only nav items

// layout/topbar/topbar.component.ts
// Shows: hamburger menu toggle, app title, username + role badge, dark mode toggle, logout button
// Dark mode toggle calls ThemeService.toggle()
```

---

## 16. Dark Mode

```typescript
// core/services/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  // Persist preference in localStorage (theme preference is NOT sensitive data)
  readonly isDark = signal<boolean>(
    localStorage.getItem(this.STORAGE_KEY) === 'dark'
  );

  constructor() {
    // Apply on init
    effect(() => {
      const dark = this.isDark();
      document.body.classList.toggle('dark-theme', dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void { this.isDark.update(v => !v); }
}
```

```scss
// styles/_themes.scss
// Angular Material custom theme — define both light and dark palettes
// Apply dark class on body:
body.dark-theme {
  --mat-sys-background: #121212;
  --mat-sys-surface: #1e1e1e;
  --mat-sys-on-background: #e0e0e0;
  // ... all Material 3 tokens overridden
}
```

---

## 17. Security Constraints

These are non-negotiable implementation rules:

| Rule | Implementation |
|---|---|
| **No JWT in localStorage** | Token lives in `AuthService` signal (memory only). Cleared on page refresh — user must re-login. Acceptable for this app's scope. |
| **No JWT in sessionStorage** | Same reason — XSS can access sessionStorage |
| **Auto-logout on expiry** | `setTimeout` in `AuthService.login()` calls `logout()` when token expires |
| **Auto-logout on 401** | `error.interceptor.ts` catches 401 and calls `auth.logout()` |
| **Role-based UI** | `auth.isAdmin()` signal gates buttons, columns, and routes in templates |
| **Route guards** | `authGuard` on all authenticated routes, `roleGuard(['Admin'])` on add/edit product routes |
| **No sensitive data in URL** | Never put tokens or passwords in query params |
| **Form inputs sanitized** | Angular's template binding escapes by default — never use `[innerHTML]` with user data |
| **HTTPS in production** | `environment.prod.ts` must use `https://` API URL |

---

## 18. Code Quality Constraints

These rules must be followed in every file:

```
1. NEVER use `any` type — use proper interfaces or `unknown`
2. NEVER subscribe inside a subscribe (use switchMap/mergeMap instead)
3. ALWAYS unsubscribe — use takeUntilDestroyed() or async pipe where possible
4. ALWAYS use signals for component state (not BehaviorSubject for new code)
5. ALWAYS use inject() function — not constructor injection
6. ALWAYS use standalone components — no NgModules
7. ALWAYS use reactive forms — no template-driven forms
8. ALWAYS use @if / @for control flow syntax (Angular 17+) — not *ngIf / *ngFor
9. NEVER use any — TypeScript strict mode must be enabled
10. Services return Observable<T> — never subscribe() inside a service
11. HTTP services are thin — zero business logic, only HTTP calls
12. Components are thin — delegate all HTTP to services
13. One component per file, one file per concern
14. Async pipe in templates preferred over manual subscribe/unsubscribe
15. finalize() operator always used to reset loading state after HTTP calls
```

### tsconfig.json strict flags (must be enabled)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 19. Environment Files

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api-url.com',   // replace before deploy
};
```

---

## 20. Angular Material Imports Pattern

Each standalone component imports only what it needs. Never import the entire Material library.

```typescript
// Example: products-list.component.ts imports
imports: [
  // Angular
  CommonModule,
  RouterLink,
  // Material
  MatTableModule,
  MatPaginatorModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatChipsModule,
  // Shared
  PageHeaderComponent,
  SearchBarComponent,
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
]
```

---

## 21. Error Handling Strategy (per layer)

| Layer | How errors are handled |
|---|---|
| **HTTP Interceptor** | 401 → logout. 403/404/500 → snack bar. 400/409 → let component handle |
| **Component** | Catches 400/409 from services, sets specific field errors or inline error messages |
| **Template** | Shows field-level `mat-error` for validation, banner for general errors |
| **Loading state** | Always uses `finalize()` to reset `isLoading`/`isSaving` regardless of success or error |

---

## 22. Pages vs PDF Requirements Mapping

| PDF Requirement | Implemented In |
|---|---|
| Login page | `features/auth/login` |
| JWT Auth | `AuthService` + `auth.interceptor.ts` |
| Role-based authorization (Admin/Employee) | `auth.guard.ts`, `role.guard.ts`, `isAdmin()` signal in templates |
| Dashboard | `features/dashboard` |
| Products List | `features/products/products-list` |
| Add/Edit Product | `features/products/product-form` (single component, two modes) |
| Inventory History | `features/inventory/inventory-history` |
| API Integration | All `core/services/*.service.ts` |
| State Management | Angular Signals throughout |
| Forms Validation | Reactive Forms + FluentValidation errors surfaced from API |
| Reusable Components | `shared/components/` (confirm dialog, page header, search bar, loading spinner) |
| Loading/Error Handling | `isLoading` signals + `finalize()` + error interceptor |
| Pagination (bonus) | `mat-paginator` on Products List and Inventory History |
| Search (bonus) | `SearchBarComponent` with debounce on Products List |
| Dark Mode (bonus) | `ThemeService` + CSS custom properties |

---

## 23. Implementation Order for the AI Agent

```
Step 1 — Scaffold
  ng new smart-inventory-frontend --routing --style=scss --standalone
  ng add @angular/material
  Set up environment files

Step 2 — Core models
  All interfaces in core/models/ and core/auth/auth.models.ts

Step 3 — Core services
  ThemeService
  AuthService (with signals + auto-logout)
  ProductService, WarehouseService, InventoryService

Step 4 — Interceptors + Guards
  auth.interceptor.ts
  error.interceptor.ts
  auth.guard.ts
  role.guard.ts

Step 5 — app.config.ts + app.routes.ts
  Wire up providers, interceptors, router

Step 6 — Shared components
  LoadingSpinnerComponent
  PageHeaderComponent
  SearchBarComponent (with debounce)
  ConfirmDialogComponent
  TransactionTypePipe
  CustomValidators

Step 7 — Layout (app shell)
  SidebarComponent
  TopbarComponent (with dark mode toggle + logout)
  LayoutComponent

Step 8 — Feature: Auth
  LoginComponent (reactive form, error handling, signals)

Step 9 — Feature: Dashboard
  DashboardComponent (forkJoin stats, recent transactions table)

Step 10 — Feature: Products
  ProductsListComponent (table, search, pagination, delete confirm)
  ProductFormComponent (add + edit modes, SKU uniqueness error)

Step 11 — Feature: Inventory
  InventoryInComponent
  InventoryOutComponent
  InventoryHistoryComponent (filter dropdowns, pagination)

Step 12 — Theming
  _variables.scss, _themes.scss
  Dark mode CSS tokens for Angular Material 3
  Apply consistent spacing, typography

Step 13 — Final
  Wire all feature routes
  Verify role-based column/button visibility
  Verify auto-logout on 401 and token expiry
  Verify all forms show correct validation messages
```

---

*End of Angular frontend plan.*
