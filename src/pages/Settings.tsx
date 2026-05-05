// File: src/pages/Settings.tsx
import { useState } from "react";
import { Settings, User, Bell, Globe, Database, Key, Check, Save, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useFirebase } from "../components/FirebaseProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function SettingsPage() {
  const { profile, refreshProfile } = useFirebase();

  const [ownerName, setOwnerName] = useState(profile?.ownerName || "");
  const [shopName, setShopName] = useState(profile?.shopName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [currency, setCurrency] = useState(profile?.currency || "RWF");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        ownerName,
        shopName,
        phone,
        location,
        currency,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-text-muted";

  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          Settings
        </h2>
        <p className="text-text-muted">Configure your shop profile and application preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Shop Profile */}
        <Card>
          <CardHeader title="Shop Profile" icon={User} />
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
                {error}
              </div>
            )}

            {/* Read-only email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Email (read-only)</label>
              <input
                type="text"
                value={profile?.email || ""}
                readOnly
                className={`${inputCls} opacity-50 cursor-not-allowed`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Your shop name"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">WhatsApp Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 000 000"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kimironko, Kigali"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60"
                >
                  <option value="RWF" className="bg-card">RWF (Rwandan Franc)</option>
                  <option value="USD" className="bg-card">USD (US Dollar)</option>
                  <option value="KES" className="bg-card">KES (Kenyan Shilling)</option>
                  <option value="UGX" className="bg-card">UGX (Ugandan Shilling)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader title="Integrations" icon={Database} />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Gemini AI API</h4>
                  <p className="text-xs text-text-muted">Status: Connected &amp; Active</p>
                </div>
              </div>
              <Badge variant="success" className="gap-1 flex items-center shrink-0">
                <Check className="w-3 h-3" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">WhatsApp Business</h4>
                  <p className="text-xs text-text-muted">Connect your official business line</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">Configure</Button>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-primary font-medium self-center">
              <Check className="w-4 h-4" /> Changes saved!
            </span>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[160px]">
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save All Changes</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}