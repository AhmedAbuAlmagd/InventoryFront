import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/pagination.model';
import { CreateProductRequest, Product, ProductFilters, UpdateProductRequest } from '../models/product.model';
import { requireData } from './api-unwrap';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/products`;

  getAll(page = 1, pageSize = 10, filters: ProductFilters = {}) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.category?.trim()) params = params.set('category', filters.category.trim());
    if (filters.isActive !== null && filters.isActive !== undefined) params = params.set('isActive', filters.isActive);
    if (filters.minPrice !== null && filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice);

    return this.http
      .get<ApiResponse<PagedResult<Product>>>(this.base, { params })
      .pipe(map(requireData));
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Product>>(`${this.base}/${id}`).pipe(map(requireData));
  }

  getCategories() {
    return this.http.get<ApiResponse<string[]>>(`${this.base}/categories`).pipe(map(requireData));
  }

  create(body: CreateProductRequest) {
    return this.http.post<ApiResponse<Product>>(this.base, body).pipe(map(requireData));
  }

  update(id: number, body: UpdateProductRequest) {
    return this.http.put<ApiResponse<Product>>(`${this.base}/${id}`, body).pipe(map(requireData));
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message ?? 'Request failed');
        }
        return void 0;
      }),
    );
  }
}
