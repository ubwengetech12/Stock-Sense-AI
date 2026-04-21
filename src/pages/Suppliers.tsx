// File: src/pages/Suppliers.tsx
import { useState } from "react";
import { Users, Plus, MessageSquare, Mail, Phone, Calendar, X, Package } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { useStore } from "../store/useStore";
import { Badge } from "../components/ui/Badge";
import { format } from "date-fns";
import { sendPurchaseOrder } from "../lib/whatsapp";
import type { Supplier, PurchaseOrder } from "../lib/types";

export default function Suppliers() {
  const { suppliers, products } = useStore();
  const [orderModal, setOrderModal] = useState<Supplier | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const supplierProducts = orderModal
    ? products.filter(p => p.supplierId === orderModal.id || orderModal.productsSupplied.some(s => p.name.toLowerCase().includes(s.toLowerCase())))
    : [];

  const handleSendOrder = async () => {
    if (!orderModal) return;
    setSending(true);
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return { productId, productName: product?.name || '', quantity, unitCost: product?.costPrice || 0 };
      });

    if (items.length === 0) { setSending(false); return; }

    const order: PurchaseOrder = {
      id: 'PO-' + Date.now(),
      supplierId: orderModal.id,
      items,
      status: 'pending',
      createdAt: new Date().toISOString(),
      sentViaWhatsApp: true,
    };

    await sendPurchaseOrder(orderModal, order);
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOrderModal(null); setQuantities({}); }, 2000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Supply Partners
          </h2>
          <p className="text-text-muted">Direct contact to your favorite distributors</p>
        </div>
        <Button className="w-full sm:w-auto gap-2">
          <Plus className="w-5 h-5" />
          Add Supplier
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🏪</div>
          <h3 className="text-lg font-bold text-white mb-2">No suppliers yet</h3>
          <p className="text-text-muted text-sm max-w-sm mb-6">Add your first supplier to start sending WhatsApp orders automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="flex flex-col">
              <CardHeader title={supplier.name} subtitle={supplier.contact} icon={Users} />
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <Phone className="w-4 h-4" />
                    {supplier.whatsappNumber}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <Mail className="w-4 h-4" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <Calendar className="w-4 h-4" />
                    Last order: {supplier.lastOrderDate ? format(new Date(supplier.lastOrderDate), 'MMM d, yyyy') : 'Never'}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide mb-2">Supplies:</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.productsSupplied.map((p, i) => (
                      <Badge key={i} variant="primary">{p}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-white/5 border-t border-white/5">
                <Button
                  onClick={() => { setOrderModal(supplier); setQuantities({}); }}
                  className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Order via WhatsApp
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOrderModal(null)} />
          <div className="relative bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">📦 Create Purchase Order</h3>
                <p className="text-sm text-text-muted">Sending to: {orderModal.name} ({orderModal.whatsappNumber})</p>
              </div>
              <button onClick={() => setOrderModal(null)} className="text-text-muted hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              <p className="text-xs text-text-muted mb-4">Enter quantities for each product you want to order:</p>
              {products.filter(p => p.currentStock <= p.minStock).map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Package className="w-4 h-4 text-danger flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-danger">Only {p.currentStock} left</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={quantities[p.id] || ''}
                    onChange={e => setQuantities(q => ({ ...q, [p.id]: Number(e.target.value) }))}
                    className="w-20 bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-primary/60"
                  />
                </div>
              ))}
              {products.filter(p => p.currentStock <= p.minStock).length === 0 && (
                <p className="text-center text-text-muted py-8">✅ All stock levels are good! Nothing urgent to order.</p>
              )}
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setOrderModal(null)}>Cancel</Button>
              <Button
                onClick={handleSendOrder}
                disabled={sending || sent}
                className="bg-[#25D366] hover:bg-[#128C7E] gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {sent ? '✅ Sent!' : sending ? 'Sending...' : 'Send on WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}