// File: src/pages/Reports.tsx
import { BarChart3, Download, Calendar, DollarSign, PieChart, ArrowUpRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const TOP_SELLERS = [
  { name: 'Milk', sales: 400 },
  { name: 'Bread', sales: 300 },
  { name: 'Soap', sales: 200 },
  { name: 'Salt', sales: 150 },
  { name: 'Oil', sales: 120 },
];

export default function Reports() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Performance Reports
          </h2>
          <p className="text-text-muted">Analyze your shop's health and margins</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <Calendar className="w-4 h-4" />
            Monthly Filter
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader title="Total Revenue" icon={DollarSign} />
          <CardContent>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-white">4.8M</h3>
              <p className="text-xs text-text-muted mb-1 opacity-60">RWF this month</p>
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-bold mt-4">
              <ArrowUpRight className="w-4 h-4" />
              +22% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Best Selling Categories" icon={PieChart} />
          <CardContent>
            <div className="flex items-center gap-4" style={{ height: 120 }}>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">Food & Drinks</span>
                  <span className="text-text-muted">65%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">Household</span>
                  <span className="text-text-muted">25%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary/60 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
              <div className="w-px h-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">Electronics</span>
                  <span className="text-text-muted">8%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary/30 h-full rounded-full" style={{ width: '8%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">Other</span>
                  <span className="text-text-muted">2%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary/10 h-full rounded-full" style={{ width: '2%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Unit Sales by Product" icon={BarChart3} />
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_SELLERS}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8892a4', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8892a4', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1f2e', border: 'none' }} />
                <Bar dataKey="sales" fill="#00d4aa" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}