export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  category: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface ProductFilters {
  search?: string;
  category?: string | null;
  isActive?: boolean | null;
  minPrice?: number | null;
  maxPrice?: number | null;
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
