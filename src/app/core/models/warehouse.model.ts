export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateWarehouseRequest {
  name: string;
  location: string | null;
}

