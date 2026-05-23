import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InventoryHistoryFilters, InventoryInRequest, InventoryOutRequest, InventoryTransaction } from '../models/inventory.model';
import { PagedResult } from '../models/pagination.model';
import { requireData } from './api-unwrap';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/inventory`;

  addIn(body: InventoryInRequest) {
    return this.http.post<ApiResponse<InventoryTransaction>>(`${this.base}/in`, body).pipe(map(requireData));
  }

  addOut(body: InventoryOutRequest) {
    return this.http.post<ApiResponse<InventoryTransaction>>(`${this.base}/out`, body).pipe(map(requireData));
  }

  getHistory(page = 1, pageSize = 20, filters: InventoryHistoryFilters = {}) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.fromUtc) params = params.set('fromUtc', filters.fromUtc);
    if (filters.toUtc) params = params.set('toUtc', filters.toUtc);

    return this.http
      .get<ApiResponse<PagedResult<InventoryTransaction>>>(`${this.base}/history`, { params })
      .pipe(map(requireData));
  }
}
