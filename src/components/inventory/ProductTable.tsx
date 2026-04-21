// File: src/components/inventory/ProductTable.tsx
import { useStore } from "../../store/useStore";
import { formatRWF } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/Button";

export function ProductTable() {
  const products = useStore(state => state.products);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
            <th className="px-6 py-4 font-bold">Product Name</th>
            <th className="px-6 py-4 font-bold">Category</th>
            <th className="px-6 py-4 font-bold">In Stock</th>
            <th className="px-6 py-4 font-bold">Price (RWF)</th>
            <th className="px-6 py-4 font-bold">Status</th>
            <th className="px-6 py-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((product) => {
            const isLow = product.currentStock <= product.minStock;
            const isCritical = product.currentStock <= product.minStock / 2;

            return (
              <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                <td className="px-6 py-4 text-sm text-text-muted">
                  <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-bold",
                    isCritical ? "text-danger" : isLow ? "text-warning" : "text-success"
                  )}>
                    {product.currentStock} {product.unit}
                  </span>
                  <div className="w-20 bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        isCritical ? "bg-danger" : isLow ? "bg-warning" : "bg-success"
                      )}
                      style={{ width: `${Math.min(100, (product.currentStock / (product.minStock * 2)) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">{formatRWF(product.sellingPrice)}</td>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4 text-text-muted" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
