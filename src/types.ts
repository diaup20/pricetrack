export type Trend = 'up' | 'down' | 'stable';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface ProductVariant {
  packageId: string;
  agentPrice: number;
  wholesalePrice: number;
  retailPrice: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unitId: string;
  packageId: string;
  brandId: string;
  agentPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  previousRetailPrice: number;
  trend: Trend;
  imageUrl?: string;
  description?: string;
  createdAt: any;
  lastUpdatedAt: any;
  variants?: ProductVariant[];
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  buyRate?: number;
  sellRate?: number;
  previousRate: number;
  trend: Trend;
  lastUpdatedAt: any;
}

export interface CategoryStats {
  total: number;
  up: number;
  down: number;
  stable: number;
}
