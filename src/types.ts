export type Trend = 'up' | 'down' | 'stable';

export interface Section {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  sectionId?: string;
  order?: number;
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
  sectionId?: string;
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
  origin?: string;
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
  region?: 'sanaa' | 'aden' | 'global';
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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
  updatedAt?: any;
}

export interface AppVisit {
  id: string;
  userId: string;
  governorateId: string;
  governorateName: string;
  userAgent?: string;
  createdAt: any;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'new_product' | 'price_update' | 'new_category' | 'system';
  referenceId?: string;
  createdAt: any;
}
