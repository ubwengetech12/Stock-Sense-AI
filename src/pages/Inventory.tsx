// File: src/pages/Inventory.tsx
import { useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import { ProductTable } from "../components/inventory/ProductTable";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useStore } from "../store/useStore";

interface NewProduct {
  name: string;
  category: 'Food & Drinks' | 'Household' | 'Electronics' | 'Clothing' | 'Other';
  unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'packs';
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
}

const EMPTY: NewProduct = {
  name: '', category: 'Food & Drinks', unit: 'pieces',
  currentStock: 0, minStock: 10, reorderPoint: 15,
  costPrice: 0, sellingPrice: 0, supplierId: ''
};

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewProduct>(EMPTY);
  const [search, setSearch] = useState('');
  const { addProduct, suppliers } = useStore();

  const handleAdd = async () => {
    if (!form.name) return;
    await addProduct(form);
    setForm(EMPTY);
    setShowModal(false);
  };

  const field = (label: string, key: keyof NewProduct, type = 'text', options?: string[]) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>
      {options ? (
        <select
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60"
        >
          {options.map(o => <option key={o} value={o} className="bg-card">{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 placeholder:text-text-muted"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-primary" />
            Your Products
          </h2>
          <p className="text-text-muted">Manage your stock, prices, and categories</p>
        </div>
        <Button className="w-full sm:w-auto gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      <Card className="p-0 border-none shadow-2xl bg-card">
        <div className="p-6 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-text-muted"
            />
          </div>
        </div>
        <ProductTable searchQuery={search} />
      </Card>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">➕ Add New Product</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-white p-1">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {field('Product Name', 'name')}
              {field('Category', 'category', 'text', ['Food & Drinks', 'Household', 'Electronics', 'Clothing', 'Other'])}
              {field('Unit', 'unit', 'text', ['pieces', 'kg', 'liters', 'boxes', 'packs'])}
              <div className="grid grid-cols-2 gap-4">
                {field('Current Stock', 'currentStock', 'number')}
                {field('Warn me below (Min Stock)', 'minStock', 'number')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('Cost Price (RWF)', 'costPrice', 'number')}
                {field('Selling Price (RWF)', 'sellingPrice', 'number')}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Supplier</label>
                <select
                  value={form.supplierId}
                  onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60"
                >
                  <option value="" className="bg-card">-- Select supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id} className="bg-card">{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!form.name}>Save Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}