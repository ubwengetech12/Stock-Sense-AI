// File: src/pages/Settings.tsx
import { Settings, User, Bell, Globe, Database, Key, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function SettingsPage() {
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
        <Card>
          <CardHeader title="Shop Profile" icon={User} />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Shop Name</label>
                <input type="text" defaultValue="Inyange Corner Shop" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Owner Name</label>
                <input type="text" defaultValue="Uwase Marie" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">WhatsApp Number</label>
                <input type="text" defaultValue="+250 788 123 456" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Currency</label>
                <select className="w-full bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white">
                  <option>RWF (Rwandan Franc)</option>
                  <option>USD (US Dollar)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Integrations" icon={Database} />
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Gemini AI API</h4>
                  <p className="text-xs text-text-muted">Status: Connected & Active</p>
                </div>
              </div>
              <Badge variant="success" className="gap-1 flex items-center">
                <Check className="w-3 h-3" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">WhatsApp Business</h4>
                  <p className="text-xs text-text-muted">Connect your official business line</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button>Save All Changes</Button>
        </div>
      </div>
    </div>
  );
}
