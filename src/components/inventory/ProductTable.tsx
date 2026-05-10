// File: src/components/inventory/ProductTable.tsx
import { useState } from "react";
import { useStore } from "../../store/useStore";
import { formatRWF } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Product } from "../../lib/types";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface ProductTableProps {
  searchQuery?: string;
  activeFilter?: string;
}

// Highlight matching text in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function ProductTable({ searchQuery = '', activeFilter = '' }: ProductTableProps) {
  const { products, suppliers, updateProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);

  // ── Smart filter logic ──────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    const isLow = p.currentStock <= p.minStock;
    const isCritical = p.currentStock <= p.minStock / 2;
    const isHealthy = !isLow;

    // Quick filter chips take priority
    if (activeFilter) {
      if (activeFilter === 'critical') return isCritical;
      if (activeFilter === 'low') return isLow && !isCritical;
      if (activeFilter === 'healthy') return isHealthy;
      return p.category === activeFilter;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // Special keyword searches
    if (q === 'out' || q === 'out of stock') return p.currentStock === 0;
    if (q === 'critical') return isCritical;
    if (q === 'low' || q === 'low stock') return isLow;
    if (q === 'healthy' || q === 'good') return isHealthy;
    if (q === 'cheap') return p.sellingPrice < 1000;
    if (q === 'expensive') return p.sellingPrice > 3000;

    // Price range: "< 1000" or "> 2000"
    const ltMatch = q.match(/^[<＜]\s*(\d+)$/);
    const gtMatch = q.match(/^[>＞]\s*(\d+)$/);
    if (ltMatch) return p.sellingPrice < Number(ltMatch[1]);
    if (gtMatch) return p.sellingPrice > Number(gtMatch[1]);

    // Stock range: "stock < 10"
    const stockLt = q.match(/stock\s*[<＜]\s*(\d+)/);
    const stockGt = q.match(/stock\s*[>＞]\s*(\d+)/);
    if (stockLt) return p.currentStock < Number(stockLt[1]);
    if (stockGt) return p.currentStock > Number(stockGt[1]);

    // General search across all text fields
    return [
      p.name,
      p.category,
      p.unit,
      isCritical ? 'critical' : isLow ? 'low stock' : 'healthy',
      String(p.currentStock),
      String(p.minStock),
      String(p.sellingPrice),
      String(p.costPrice),
      supplier?.name ?? '',
      supplier?.contact ?? '',
    ].some(field => field.toLowerCase().includes(q));
  });

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await updateProduct(editingProduct.id, form);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/60 w-full";

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Product Name</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Supplier</th>
              <th className="px-6 py-4 font-bold">In Stock</th>
              <th className="px-6 py-4 font-bold">Price (RWF)</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-white font-bold mb-1">No products found</p>
                  <p className="text-text-muted text-sm">
                    Try searching by name, category, supplier, or type "critical", "low", "cheap"
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((product) => {
              const supplier = suppliers.find(s => s.id === product.supplierId);
              const isLow = product.currentStock <= product.minStock;
              const isCritical = product.currentStock <= product.minStock / 2;
              const q = searchQuery.trim();

              return (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">
                    <Highlight text={product.name} query={q} />
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">
                      <Highlight text={product.category} query={q} />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {supplier
                      ? <Highlight text={supplier.name} query={q} />
                      : <span className="text-white/20">—</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-bold",
                      isCritical ? "text-danger" : isLow ? "text-warning" : "text-success"
                    )}>
                      <Highlight text={String(product.currentStock)} query={q} /> {product.unit}
                    </span>
                    <div className="w-20 bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isCritical ? "bg-danger" : isLow ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${Math.min(100, (product.currentStock / (product.minStock * 2)) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <Highlight text={formatRWF(product.sellingPrice)} query={q} />
                  </td>
                  <td className="px-6 py-4">
                    {isCritical ? (
                      <Badge variant="danger">Critical Stock</Badge>
                    ) : isLow ? (
                      <Badge variant="warning">Low Stock</Badge>
                    ) : (
                      <Badge variant="success">Healthy</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                        <Edit2 className="w-4 h-4 text-text-muted" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Showing <strong className="text-white">{filtered.length}</strong> of <strong className="text-white">{products.length}</strong> products</span>
            <span>
              {filtered.filter(p => p.currentStock <= p.minStock / 2).length > 0 && (
                <span className="text-danger font-bold mr-3">
                  🔴 {filtered.filter(p => p.currentStock <= p.minStock / 2).length} critical
                </span>
              )}
              {filtered.filter(p => p.currentStock <= p.minStock && p.currentStock > p.minStock / 2).length > 0 && (
                <span className="text-warning font-bold">
                  ⚠️ {filtered.filter(p => p.currentStock <= p.minStock && p.currentStock > p.minStock / 2).length} low
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">✏️ Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="text-text-muted hover:text-white p-1">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Product Name</label>
                <input className={inputClass} value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Category</label>
                <select className={inputClass} value={form.category ?? ''} onChange={e => setForm(f => ({ ...f, category: e.target.value as Product['category'] }))}>
                  {['Food & Drinks', 'Household', 'Electronics', 'Clothing', 'Other'].map(o => (
                    <option key={o} value={o} className="bg-card">{o}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Unit</label>
                <select className={inputClass} value={form.unit ?? ''} onChange={e => setForm(f => ({ ...f, unit: e.target.value as Product['unit'] }))}>
                  {['pieces', 'kg', 'liters', 'boxes', 'packs'].map(o => (
                    <option key={o} value={o} className="bg-card">{o}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Current Stock</label>
                  <input type="number" className={inputClass} value={form.currentStock ?? 0} onChange={e => setForm(f => ({ ...f, currentStock: Number(e.target.value) }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Min Stock</label>
                  <input type="number" className={inputClass} value={form.minStock ?? 0} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Cost Price (RWF)</label>
                  <input type="number" className={inputClass} value={form.costPrice ?? 0} onChange={e => setForm(f => ({ ...f, costPrice: Number(e.target.value) }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Selling Price (RWF)</label>
                  <input type="number" className={inputClass} value={form.sellingPrice ?? 0} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}