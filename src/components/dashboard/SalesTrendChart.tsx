// File: src/components/dashboard/SalesTrendChart.tsx
import { useMemo } from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStore } from "../../store/useStore";
import { subDays, format, startOfDay } from "date-fns";

export function SalesTrendChart() {
  const sales = useStore((state) => state.sales);

  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = startOfDay(day).toISOString().slice(0, 10);
      const total = sales
        .filter((s) => s.date.slice(0, 10) === dayStr)
        .reduce((acc, s) => acc + s.totalAmount, 0);
      return {
        name: format(day, "EEE"),
        sales: total,
      };
    });
  }, [sales]);

  const maxVal = Math.max(...data.map((d) => d.sales), 1);

  return (
    <Card className="h-full">
      <CardHeader
        title="Weekly Sales Trend"
        subtitle="Revenue in RWF (last 7 days)"
        icon={BarChart3}
      />
      <CardContent className="h-[300px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3b" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8892a4", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8892a4", fontSize: 10 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                backgroundColor: "#1a1f2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              itemStyle={{ color: "#00d4aa" }}
              formatter={(value: number) =>
                [`${value.toLocaleString()} RWF`, "Sales"]
              }
            />
            <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.sales >= maxVal * 0.7 ? "#00d4aa" : "#32394e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}