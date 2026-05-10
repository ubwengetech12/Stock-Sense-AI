// File: src/components/SuperAdmin.tsx
// Triggered by clicking the "S" logo 20 times in Sidebar.tsx
// Password: import.meta.env.VITE_ADMIN_PASSWORD

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Shield,
  X,
  Users,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Edit2,
  Trash2,
  Save,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  uid: string;
  email: string;
  ownerName: string;
  shopName: string;
  phone: string;
  location: string;
  currency: string;
  createdAt: string;
}

interface AnyRecord {
  id: string;
  [key: string]: any;
}

type CollectionName = "users" | "products" | "suppliers" | "sales" | "orders";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLLECTION_META: Record<CollectionName, { label: string; icon: any; color: string; sortField: string }> = {
  users:     { label: "Users",     icon: Users,       color: "#e74c3c", sortField: "createdAt" },
  products:  { label: "Products",  icon: Package,     color: "#e67e22", sortField: "createdAt" },
  suppliers: { label: "Suppliers", icon: Truck,        color: "#9b59b6", sortField: "name" },
  sales:     { label: "Sales",     icon: ShoppingCart, color: "#27ae60", sortField: "date" },
  orders:    { label: "Orders",    icon: BarChart3,    color: "#2980b9", sortField: "createdAt" },
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  record,
  collectionName,
  onSave,
  onClose,
}: {
  record: AnyRecord;
  collectionName: CollectionName;
  onSave: (id: string, updates: Partial<AnyRecord>) => Promise<void>;
  onClose: () => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    Object.entries(record).forEach(([k, v]) => {
      if (k !== "id") f[k] = formatValue(v);
    });
    return f;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updates: Record<string, any> = {};
    Object.entries(fields).forEach(([k, v]) => {
      const num = Number(v);
      if (v !== "" && !isNaN(num) && typeof record[k] === "number") {
        updates[k] = num;
      } else {
        updates[k] = v;
      }
    });
    await onSave(record.id, updates);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border"
        style={{ backgroundColor: "#0d0d14", borderColor: "#e74c3c44" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#e74c3c22", backgroundColor: "#e74c3c0a" }}
        >
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5" style={{ color: "#e74c3c" }} />
            <span className="font-bold text-white">
              Edit {collectionName.slice(0, -1)} —{" "}
              <span style={{ color: "#e74c3c" }}>{record.id.slice(0, 12)}...</span>
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {Object.entries(fields).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#e74c3c" }}>
                {key}
              </label>
              <input
                value={val}
                onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                style={{ backgroundColor: "#ffffff08", border: "1px solid #ffffff15" }}
                onFocus={(e) => (e.target.style.borderColor = "#e74c3c60")}
                onBlur={(e) => (e.target.style.borderColor = "#ffffff15")}
              />
            </div>
          ))}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3 border-t" style={{ borderColor: "#ffffff10" }}>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ backgroundColor: "#ffffff08" }}
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: "#e74c3c" }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Collection Table ─────────────────────────────────────────────────────────

function CollectionTable({
  collectionName,
  records,
  onEdit,
  onDelete,
}: {
  collectionName: CollectionName;
  records: AnyRecord[];
  onEdit: (record: AnyRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        No records found in this collection.
      </div>
    );
  }

  const allKeys = Array.from(new Set(records.flatMap((r) => Object.keys(r)))).filter(
    (k) => k !== "id"
  );

  const PREVIEW_KEYS = allKeys.slice(0, 5);
  const EXTRA_KEYS = allKeys.slice(5);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #ffffff08" }}>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#e74c3c" }}>
              ID
            </th>
            {PREVIEW_KEYS.map((k) => (
              <th key={k} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8892a4" }}>
                {k}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8892a4" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <>
              <tr
                key={record.id}
                className="group transition-colors"
                style={{ borderBottom: "1px solid #ffffff05" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#ffffff04")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "#e74c3c" }}>
                  {record.id.slice(0, 10)}...
                </td>
                {PREVIEW_KEYS.map((k) => (
                  <td key={k} className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: "#c0c8d8" }}>
                    {formatValue(record[k]).slice(0, 60)}
                    {formatValue(record[k]).length > 60 ? "…" : ""}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {EXTRA_KEYS.length > 0 && (
                      <button
                        onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                        className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-white"
                        style={{ backgroundColor: "#ffffff08" }}
                        title="Expand"
                      >
                        {expanded === record.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: "#3498db22", color: "#3498db" }}
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: "#e74c3c22", color: "#e74c3c" }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
              {expanded === record.id && EXTRA_KEYS.length > 0 && (
                <tr key={`${record.id}-expand`} style={{ backgroundColor: "#ffffff03" }}>
                  <td colSpan={PREVIEW_KEYS.length + 2} className="px-6 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {EXTRA_KEYS.map((k) => (
                        <div key={k}>
                          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#e74c3c88" }}>
                            {k}
                          </p>
                          <p className="text-xs break-all" style={{ color: "#8892a4" }}>
                            {formatValue(record[k]).slice(0, 120)}
                            {formatValue(record[k]).length > 120 ? "…" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    const correct = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === correct) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 3000);
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl p-8 border text-center",
          shake && "animate-[wiggle_0.5s_ease-in-out]"
        )}
        style={{
          backgroundColor: "#0d0d14",
          borderColor: error ? "#e74c3c" : "#e74c3c44",
          boxShadow: "0 0 60px #e74c3c22",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#e74c3c15", border: "1px solid #e74c3c40" }}
        >
          <Shield className="w-8 h-8" style={{ color: "#e74c3c" }} />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Super Admin</h2>
        <p className="text-sm mb-6" style={{ color: "#8892a4" }}>
          Enter the admin password to proceed
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#e74c3c15", color: "#e74c3c", border: "1px solid #e74c3c30" }}
          >
            Incorrect password. Access denied.
          </div>
        )}

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Admin password"
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none pr-11"
            style={{
              backgroundColor: "#ffffff08",
              border: `1px solid ${error ? "#e74c3c" : "#ffffff15"}`,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            style={{ color: "#8892a4" }}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
          style={{ backgroundColor: "#e74c3c" }}
        >
          Unlock Admin Panel
        </button>
      </div>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export function SuperAdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [activeCol, setActiveCol] = useState<CollectionName>("users");
  const [data, setData] = useState<Record<CollectionName, AnyRecord[]>>({
    users: [],
    products: [],
    suppliers: [],
    sales: [],
    orders: [],
  });
  const [loading, setLoading] = useState(false);
  const [editRecord, setEditRecord] = useState<AnyRecord | null>(null);
  const [stats, setStats] = useState<Record<CollectionName, number>>({
    users: 0, products: 0, suppliers: 0, sales: 0, orders: 0,
  });

  const fetchCollection = useCallback(async (col: CollectionName) => {
    setLoading(true);
    try {
      const sortField = COLLECTION_META[col].sortField;
      let docs: AnyRecord[] = [];

      try {
        // Try ordered fetch first
        const q = query(collection(db, col), orderBy(sortField, col === "suppliers" ? "asc" : "desc"), limit(200));
        const snap = await getDocs(q);
        docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AnyRecord[];
      } catch {
        // Fallback: unordered fetch (works even if index missing)
        const snap = await getDocs(collection(db, col));
        docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AnyRecord[];
      }

      setData((prev) => ({ ...prev, [col]: docs }));
      setStats((prev) => ({ ...prev, [col]: docs.length }));
    } catch (e) {
      console.error(`Failed to fetch ${col}:`, e);
    }
    setLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    const cols: CollectionName[] = ["users", "products", "suppliers", "sales", "orders"];
    for (const col of cols) {
      await fetchCollection(col);
    }
  }, [fetchCollection]);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  const handleEdit = async (id: string, updates: Partial<AnyRecord>) => {
    await updateDoc(doc(db, activeCol, id), updates);
    fetchCollection(activeCol);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${activeCol.slice(0, -1)}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, activeCol, id));
    fetchCollection(activeCol);
  };

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  const meta = COLLECTION_META[activeCol];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: "#080a10" }}>
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{
          borderColor: "#e74c3c33",
          background: "linear-gradient(90deg, #e74c3c0a 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#e74c3c20", border: "1px solid #e74c3c50" }}
          >
            <Shield className="w-5 h-5" style={{ color: "#e74c3c" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">Super Admin Panel</h1>
            <p className="text-xs mt-0.5" style={{ color: "#e74c3c" }}>
              Full system access · StockSense AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: "#e74c3c15", color: "#e74c3c", border: "1px solid #e74c3c30" }}
          >
            <Database className="w-3 h-3" />
            Firestore Live
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: "#ffffff08", color: "#8892a4" }}
            title="Refresh all"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: "#e74c3c20", color: "#e74c3c" }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Stats / Tab Bar */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto shrink-0" style={{ borderBottom: "1px solid #ffffff08" }}>
        {(Object.entries(COLLECTION_META) as [CollectionName, typeof COLLECTION_META[CollectionName]][]).map(
          ([col, m]) => {
            const Icon = m.icon;
            const isActive = col === activeCol;
            return (
              <button
                key={col}
                onClick={() => { setActiveCol(col); fetchCollection(col); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all shrink-0 border"
                style={{
                  backgroundColor: isActive ? `${m.color}18` : "#ffffff05",
                  borderColor: isActive ? `${m.color}50` : "#ffffff10",
                  color: isActive ? m.color : "#8892a4",
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-bold">{m.label}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    backgroundColor: isActive ? `${m.color}30` : "#ffffff08",
                    color: isActive ? m.color : "#8892a4",
                  }}
                >
                  {stats[col]}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #ffffff05" }}>
          <div className="flex items-center gap-3">
            {(() => { const Icon = meta.icon; return <Icon className="w-5 h-5" style={{ color: meta.color }} />; })()}
            <h2 className="font-bold text-white">
              {meta.label}{" "}
              <span className="text-sm font-normal" style={{ color: "#8892a4" }}>
                ({data[activeCol].length} records)
              </span>
            </h2>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#8892a4" }}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        <div className="px-2">
          <CollectionTable
            collectionName={activeCol}
            records={data[activeCol]}
            onEdit={setEditRecord}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Warning banner */}
      <div
        className="px-6 py-3 flex items-center gap-3 text-xs shrink-0"
        style={{ backgroundColor: "#e74c3c08", borderTop: "1px solid #e74c3c20", color: "#e74c3c88" }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#e74c3c" }} />
        <span>
          <strong className="text-white">Super Admin Mode</strong> — Changes are permanent and affect all users. Proceed with caution.
        </span>
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <EditModal
          record={editRecord}
          collectionName={activeCol}
          onSave={handleEdit}
          onClose={() => setEditRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Hook: Secret Click Trigger ───────────────────────────────────────────────

export function useAdminTrigger(targetClicks = 20) {
  const [clickCount, setClickCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [lastClick, setLastClick] = useState(0);

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClick > 3000) {
      setClickCount(1);
    } else {
      setClickCount((c) => {
        const next = c + 1;
        if (next >= targetClicks) {
          setShowAdmin(true);
          return 0;
        }
        return next;
      });
    }
    setLastClick(now);
  }, [lastClick, targetClicks]);

  return { clickCount, handleLogoClick, showAdmin, setShowAdmin };
}