import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateWarehouseRequest, Warehouse } from '../models/warehouse.model';
import { requireData } from './api-unwrap';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/warehouses`;

  getAll() {
    return this.http.get<ApiResponse<Warehouse[]>>(this.base).pipe(map(requireData));
  }

  create(body: CreateWarehouseRequest) {
    return this.http.post<ApiResponse<Warehouse>>(this.base, body).pipe(map(requireData));
  }
}

