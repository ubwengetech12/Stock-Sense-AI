// File: src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Product, Supplier, SaleRecord, ForecastItem, 
  StockAlert, Competitor, DashboardStats, PurchaseOrder 
} from '../lib/types';
import { calculateForecast } from '../lib/forecast';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { subDays, format } from 'date-fns';

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const SEED_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Inyange Industries', contact: 'Jean Pierre', whatsappNumber: '+250788000001', email: 'orders@inyange.rw', productsSupplied: ['Milk', 'Juice'], lastOrderDate: subDays(new Date(), 5).toISOString() },
  { id: 's2', name: 'Bakhresa Rwanda', contact: 'Marie Claire', whatsappNumber: '+250788000002', email: 'orders@bakhresa.rw', productsSupplied: ['Bread', 'Noodles'], lastOrderDate: subDays(new Date(), 12).toISOString() },
  { id: 's3', name: 'Makro Kigali', contact: 'Patrick', whatsappNumber: '+250788000003', email: 'orders@makro.rw', productsSupplied: ['Omo', 'Blue Band', 'Colgate'], lastOrderDate: subDays(new Date(), 3).toISOString() },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Inyange Milk 1L', category: 'Food & Drinks', unit: 'pieces', currentStock: 4, minStock: 20, reorderPoint: 30, costPrice: 700, sellingPrice: 900, supplierId: 's1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p2', name: 'Ubunyobwa Bread', category: 'Food & Drinks', unit: 'pieces', currentStock: 8, minStock: 30, reorderPoint: 40, costPrice: 500, sellingPrice: 700, supplierId: 's2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p3', name: 'Blue Band 500g', category: 'Food & Drinks', unit: 'pieces', currentStock: 12, minStock: 25, reorderPoint: 35, costPrice: 1800, sellingPrice: 2200, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p4', name: 'Omo Washing Powder 1kg', category: 'Household', unit: 'pieces', currentStock: 45, minStock: 10, reorderPoint: 20, costPrice: 2500, sellingPrice: 3200, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p5', name: 'Airtel SIM Card', category: 'Electronics', unit: 'pieces', currentStock: 23, minStock: 5, reorderPoint: 10, costPrice: 100, sellingPrice: 500, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p6', name: 'Coca Cola 500ml', category: 'Food & Drinks', unit: 'pieces', currentStock: 60, minStock: 24, reorderPoint: 36, costPrice: 400, sellingPrice: 600, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p7', name: 'Colgate Toothpaste', category: 'Household', unit: 'pieces', currentStock: 18, minStock: 10, reorderPoint: 15, costPrice: 1200, sellingPrice: 1600, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p8', name: 'Indomie Noodles', category: 'Food & Drinks', unit: 'packs', currentStock: 3, minStock: 20, reorderPoint: 30, costPrice: 300, sellingPrice: 500, supplierId: 's2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p9', name: 'Protector Sunscreen', category: 'Household', unit: 'pieces', currentStock: 7, minStock: 5, reorderPoint: 10, costPrice: 3000, sellingPrice: 4500, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p10', name: 'Notebook A4', category: 'Other', unit: 'pieces', currentStock: 35, minStock: 10, reorderPoint: 15, costPrice: 800, sellingPrice: 1200, supplierId: 's3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

/** Generate 90 days of fake sales history for all seed products */
function generateSeedSales(): SaleRecord[] {
  const records: SaleRecord[] = [];
  SEED_PRODUCTS.forEach(product => {
    for (let i = 90; i >= 0; i--) {
      const qty = Math.floor(Math.random() * 20) + 5;
      records.push({
        id: `sale-${product.id}-${i}`,
        productId: product.id,
        quantity: qty,
        totalAmount: qty * product.sellingPrice,
        date: subDays(new Date(), i).toISOString(),
      });
    }
  });
  return records;
}

const SEED_SALES = generateSeedSales();

// ─── STORE ────────────────────────────────────────────────────────────────────

interface StockSenseState {
  products: Product[];
  suppliers: Supplier[];
  sales: SaleRecord[];
  alerts: StockAlert[];
  competitors: Competitor[];
  forecast: ForecastItem[];
  orders: PurchaseOrder[];
  stats: DashboardStats;
  isInitialized: boolean;
  
  initialize: () => () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (productId: string, quantityChange: number) => Promise<void>;
  addSale: (sale: Omit<SaleRecord, 'id' | 'date'>) => Promise<void>;
  generateForecasts: () => void;
  updateAlerts: () => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (id: string, status: PurchaseOrder['status']) => Promise<void>;
  computeStats: () => void;
}

export const useStore = create<StockSenseState>()(
  persist(
    (set, get) => ({
      // ── Initial state uses seed data so the app looks alive immediately ──
      products: SEED_PRODUCTS,
      suppliers: SEED_SUPPLIERS,
      sales: SEED_SALES,
      alerts: [],
      competitors: [],
      forecast: [],
      orders: [],
      isInitialized: false,
      stats: {
        totalProducts: SEED_PRODUCTS.length,
        lowStockAlerts: SEED_PRODUCTS.filter(p => p.currentStock <= p.minStock).length,
        monthlySalesRWF: 4900000,
        overstockSavedRWF: 680000,
      },

      initialize: () => {
        const user = auth.currentUser;
        // If no user logged in, keep seed data visible for demo
        if (!user) {
          get().updateAlerts();
          get().generateForecasts();
          return () => {};
        }

        const qProducts = query(collection(db, 'products'), where('userId', '==', user.uid));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
          if (snapshot.docs.length > 0) {
            // Real data exists — replace seed data
            const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
            set({ products });
          }
          get().updateAlerts();
          get().generateForecasts();
        });

        const qSales = query(collection(db, 'sales'), where('userId', '==', user.uid));
        const unsubSales = onSnapshot(qSales, (snapshot) => {
          if (snapshot.docs.length > 0) {
            const sales = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SaleRecord));
            set({ sales });
          }
        });

        const qSuppliers = query(collection(db, 'suppliers'), where('userId', '==', user.uid));
        const unsubSuppliers = onSnapshot(qSuppliers, (snapshot) => {
          if (snapshot.docs.length > 0) {
            const suppliers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
            set({ suppliers });
          }
        });

        set({ isInitialized: true });
        return () => { unsubProducts(); unsubSales(); unsubSuppliers(); };
      },

      addProduct: async (p) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
          await addDoc(collection(db, 'products'), {
            ...p,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } catch (e) { handleFirestoreError(e, 'create', 'products'); }
      },

      updateProduct: async (id, updates) => {
        try {
          await updateDoc(doc(db, 'products', id), { ...updates, updatedAt: new Date().toISOString() });
        } catch (e) { handleFirestoreError(e, 'update', `products/${id}`); }
      },

      deleteProduct: async (id) => {
        try {
          await deleteDoc(doc(db, 'products', id));
        } catch (e) { handleFirestoreError(e, 'delete', `products/${id}`); }
      },

      updateStock: async (id, change) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        try {
          await updateDoc(doc(db, 'products', id), {
            currentStock: Math.max(0, product.currentStock + change),
            updatedAt: new Date().toISOString()
          });
        } catch (e) { handleFirestoreError(e, 'update', `products/${id}`); }
      },

      addSale: async (s) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
          await addDoc(collection(db, 'sales'), {
            ...s,
            userId: user.uid,
            date: new Date().toISOString()
          });
          await get().updateStock(s.productId, -s.quantity);
        } catch (e) { handleFirestoreError(e, 'create', 'sales'); }
      },

      generateForecasts: () => {
        const { products, sales } = get();
        const allForecasts = products.flatMap(p => calculateForecast(p, sales));
        set({ forecast: allForecasts });
      },

      updateAlerts: () => {
        const { products } = get();
        const newAlerts: StockAlert[] = products
          .filter(p => p.currentStock <= p.minStock)
          .map(p => ({
            id: `alert-${p.id}`,
            productId: p.id,
            productName: p.name,
            currentStock: p.currentStock,
            daysRemaining: Math.max(1, Math.floor(p.currentStock / 5)),
            suggestedOrder: p.minStock * 2,
            urgency: p.currentStock <= p.minStock / 2 ? 'critical' : 'low',
          }));
        const monthlySalesRWF = products.reduce((acc, p) => acc + p.sellingPrice * 30, 0);
        set({
          alerts: newAlerts,
          stats: {
            totalProducts: products.length,
            lowStockAlerts: newAlerts.length,
            monthlySalesRWF,
            overstockSavedRWF: 680000,
          }
        });
      },

      computeStats: () => get().updateAlerts(),

      addPurchaseOrder: async (o) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
          await addDoc(collection(db, 'orders'), {
            ...o,
            userId: user.uid,
            createdAt: new Date().toISOString()
          });
        } catch (e) { handleFirestoreError(e, 'create', 'orders'); }
      },

      updateOrderStatus: async (id, status) => {
        try {
          await updateDoc(doc(db, 'orders', id), { status });
        } catch (e) { handleFirestoreError(e, 'update', `orders/${id}`); }
      },
    }),
    {
      name: 'stocksense-storage',
      partialize: (state) => ({
        products: state.products,
        suppliers: state.suppliers,
        sales: state.sales,
        orders: state.orders,
      }),
    }
  )
);