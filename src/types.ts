export type Trend = 'up' | 'down' | 'stable';

export interface Section {
  id: string;
  name: string;
  icon?: string;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  sectionId?: string;
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
  previousRetailPrice: number;
  trend: Trend;
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

export type CategoryStats = {
  total: number;
  up: number;
  down: number;
  stable: number;
}

export type ReportType = string;
export type ReportStatus = 'new' | 'review' | 'resolved' | 'rejected';

export interface ReportMeta {
  id: string;
  name: string;
}

export interface Governorate {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  governorateId: string;
}

export interface Report {
  id: string;
  reporterName: string;
  reporterPhone: string;
  reportDate: any;
  reportType: ReportType;
  itemName: string;
  currentPrice: number;
  storeName: string;
  governorate: string;
  district: string;
  locationDetails: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  createdAt: any;
}
