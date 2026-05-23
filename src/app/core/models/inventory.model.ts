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
  createdAtUtc: string;
}

export interface InventoryHistoryFilters {
  productId?: number | null;
  warehouseId?: number | null;
  type?: TransactionType | null;
  search?: string;
  fromUtc?: string | null;
  toUtc?: string | null;
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
