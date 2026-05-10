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
  collection, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc
} from 'firebase/firestore';
import { subDays } from 'date-fns';
import { generateAIInsights, AIInsights } from '../lib/gemini';

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

// ─── Constants ────────────────────────────────────────────────────────────────

// 30 minutes in milliseconds — minimum gap between Gemini calls
const AI_COOLDOWN_MS = 30 * 60 * 1000;

// Firestore doc that caches the last AI result
const AI_CACHE_DOC = 'ai_insights/latest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureInFirestore(
  collectionName: string,
  item: { id: string; [key: string]: any }
) {
  const ref = doc(db, collectionName, item.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...item, userId: auth.currentUser?.uid ?? 'exhibition' });
  }
}

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

  // AI Insights
  aiInsights: AIInsights | null;
  aiLoading: boolean;
  aiError: string | null;
  aiLastFetched: number | null; // timestamp ms

  initialize: () => () => void;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (productId: string, quantityChange: number) => Promise<void>;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Sales
  addSale: (sale: Omit<SaleRecord, 'id' | 'date'>) => Promise<void>;

  // Orders
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (id: string, status: PurchaseOrder['status']) => Promise<void>;

  // AI
  fetchAIInsights: (force?: boolean) => Promise<void>;

  generateForecasts: () => void;
  updateAlerts: () => void;
  computeStats: () => void;
}

export const useStore = create<StockSenseState>()(
  persist(
    (set, get) => ({
      products: SEED_PRODUCTS,
      suppliers: SEED_SUPPLIERS,
      sales: SEED_SALES,
      alerts: [],
      competitors: [],
      forecast: [],
      orders: [],
      isInitialized: false,
      aiInsights: null,
      aiLoading: false,
      aiError: null,
      aiLastFetched: null,
      stats: {
        totalProducts: SEED_PRODUCTS.length,
        lowStockAlerts: SEED_PRODUCTS.filter(p => p.currentStock <= p.minStock).length,
        monthlySalesRWF: 4900000,
        overstockSavedRWF: 680000,
      },

      initialize: () => {
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          if (snapshot.docs.length > 0) {
            const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
            set({ products });
          }
          get().updateAlerts();
          get().generateForecasts();
        }, (err) => console.error('products listener:', err));

        const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
          if (snapshot.docs.length > 0) {
            const sales = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SaleRecord));
            set({ sales });
          }
        }, (err) => console.error('sales listener:', err));

        const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
          if (snapshot.docs.length > 0) {
            const suppliers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
            set({ suppliers });
          }
        }, (err) => console.error('suppliers listener:', err));

        // Load cached AI insights from Firestore on startup
        const unsubAI = onSnapshot(doc(db, 'ai_insights', 'latest'), (snap) => {
          if (snap.exists()) {
            const cached = snap.data() as AIInsights & { fetchedAt: number };
            set({
              aiInsights: cached,
              aiLastFetched: cached.fetchedAt ?? null,
            });
          }
        }, () => {/* ignore if collection doesn't exist yet */});

        set({ isInitialized: true });
        return () => {
          unsubProducts();
          unsubSales();
          unsubSuppliers();
          unsubAI();
        };
      },

      // ── AI Insights ───────────────────────────────────────────────────────

      fetchAIInsights: async (force = false) => {
        const { aiLoading, aiLastFetched, products, sales, suppliers } = get();

        // Prevent parallel calls
        if (aiLoading) return;

        // Enforce cooldown unless forced
        if (!force && aiLastFetched && Date.now() - aiLastFetched < AI_COOLDOWN_MS) {
          const remainingMin = Math.ceil((AI_COOLDOWN_MS - (Date.now() - aiLastFetched)) / 60000);
          set({ aiError: `Next refresh available in ${remainingMin} min` });
          setTimeout(() => set({ aiError: null }), 3000);
          return;
        }

        set({ aiLoading: true, aiError: null });

        try {
          const insights = await generateAIInsights(products, sales, suppliers);
          const fetchedAt = Date.now();

          // Cache result in Firestore so all users share it
          try {
            await setDoc(doc(db, 'ai_insights', 'latest'), {
              ...insights,
              fetchedAt,
            });
          } catch {
            // Cache write failed — still show result locally
          }

          set({
            aiInsights: insights,
            aiLastFetched: fetchedAt,
            aiLoading: false,
            aiError: null,
          });
        } catch (e: any) {
          set({
            aiLoading: false,
            aiError: 'AI request failed. Try again shortly.',
          });
        }
      },

      // ── Products ──────────────────────────────────────────────────────────

      addProduct: async (p) => {
        const now = new Date().toISOString();
        const data = {
          ...p,
          userId: auth.currentUser?.uid ?? 'exhibition',
          createdAt: now,
          updatedAt: now,
        };
        try {
          const docRef = await addDoc(collection(db, 'products'), data);
          set(state => ({ products: [...state.products, { ...data, id: docRef.id }] }));
          get().updateAlerts();
          get().generateForecasts();
        } catch (e) { handleFirestoreError(e, 'create', 'products'); }
      },

      updateProduct: async (id, updates) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        try {
          await ensureInFirestore('products', product);
          const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
          await updateDoc(doc(db, 'products', id), updatedFields);
          set(state => ({
            products: state.products.map(p => p.id === id ? { ...p, ...updatedFields } : p),
          }));
          get().updateAlerts();
        } catch (e) { handleFirestoreError(e, 'update', `products/${id}`); }
      },

      deleteProduct: async (id) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        try {
          await ensureInFirestore('products', product);
          await deleteDoc(doc(db, 'products', id));
          set(state => ({ products: state.products.filter(p => p.id !== id) }));
          get().updateAlerts();
        } catch (e) { handleFirestoreError(e, 'delete', `products/${id}`); }
      },

      updateStock: async (id, change) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        try {
          await ensureInFirestore('products', product);
          const newStock = Math.max(0, product.currentStock + change);
          await updateDoc(doc(db, 'products', id), { currentStock: newStock, updatedAt: new Date().toISOString() });
          set(state => ({
            products: state.products.map(p => p.id === id ? { ...p, currentStock: newStock } : p),
          }));
          get().updateAlerts();
        } catch (e) { handleFirestoreError(e, 'update', `products/${id}`); }
      },

      // ── Suppliers ─────────────────────────────────────────────────────────

      addSupplier: async (s) => {
        const data = {
          ...s,
          userId: auth.currentUser?.uid ?? 'exhibition',
          lastOrderDate: null,
        };
        try {
          const docRef = await addDoc(collection(db, 'suppliers'), data);
          set(state => ({ suppliers: [...state.suppliers, { ...data, id: docRef.id }] }));
        } catch (e) { handleFirestoreError(e, 'create', 'suppliers'); }
      },

      deleteSupplier: async (id) => {
        const supplier = get().suppliers.find(s => s.id === id);
        if (!supplier) return;
        try {
          await ensureInFirestore('suppliers', supplier);
          await deleteDoc(doc(db, 'suppliers', id));
          set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
        } catch (e) { handleFirestoreError(e, 'delete', `suppliers/${id}`); }
      },

      // ── Sales ─────────────────────────────────────────────────────────────

      addSale: async (s) => {
        const now = new Date().toISOString();
        const data = {
          ...s,
          userId: auth.currentUser?.uid ?? 'exhibition',
          date: now,
        };
        try {
          const docRef = await addDoc(collection(db, 'sales'), data);
          set(state => ({ sales: [{ ...data, id: docRef.id }, ...state.sales] }));
          await get().updateStock(s.productId, -s.quantity);
        } catch (e) { handleFirestoreError(e, 'create', 'sales'); }
      },

      // ── Orders ────────────────────────────────────────────────────────────

      addPurchaseOrder: async (o) => {
        try {
          await addDoc(collection(db, 'orders'), {
            ...o,
            userId: auth.currentUser?.uid ?? 'exhibition',
            createdAt: new Date().toISOString(),
          });
        } catch (e) { handleFirestoreError(e, 'create', 'orders'); }
      },

      updateOrderStatus: async (id, status) => {
        try {
          await updateDoc(doc(db, 'orders', id), { status });
        } catch (e) { handleFirestoreError(e, 'update', `orders/${id}`); }
      },

      // ── Computed ──────────────────────────────────────────────────────────

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
          },
        });
      },

      computeStats: () => get().updateAlerts(),
    }),
    {
      name: 'stocksense-storage',
      partialize: (state) => ({
        products: state.products,
        suppliers: state.suppliers,
        sales: state.sales,
        orders: state.orders,
        // Persist last AI insights locally so it survives page refresh
        aiInsights: state.aiInsights,
        aiLastFetched: state.aiLastFetched,
      }),
    }
  )
);