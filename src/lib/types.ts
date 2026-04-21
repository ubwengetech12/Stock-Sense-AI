/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// File: src/lib/types.ts

export interface Product {
  id: string;
  name: string;
  category: 'Food & Drinks' | 'Household' | 'Electronics' | 'Clothing' | 'Other';
  unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'packs';
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  whatsappNumber: string;
  email: string;
  productsSupplied: string[];
  lastOrderDate?: string;
}

export interface SaleRecord {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  date: string;
}

export interface ForecastItem {
  productId: string;
  productName: string;
  day: string;
  predictedUnits: number;
  confidence: number;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  daysRemaining: number;
  suggestedOrder: number;
  urgency: 'critical' | 'low' | 'watch';
}

export interface CompetitorProduct {
  productName: string;
  theirPrice: number;
  ourPrice: number;
  marginGap: number;
  suggestedCounter: number;
}

export interface Competitor {
  id: string;
  name: string;
  location: string;
  products: CompetitorProduct[];
}

export interface POItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: POItem[];
  status: 'pending' | 'sent' | 'received';
  createdAt: string;
  sentViaWhatsApp: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockAlerts: number;
  monthlySalesRWF: number;
  overstockSavedRWF: number;
}
