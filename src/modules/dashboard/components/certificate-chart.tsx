"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ChartPoint } from "../hooks";

interface CertificateChartProps {
  data: ChartPoint[];
  loading: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

export default function CertificateChart({ data, loading }: CertificateChartProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-sm flex items-center justify-center h-[340px]">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-container-low flex items-center justify-between">
        <h3 className="font-bold text-lg text-on-surface">Certificados Emitidos</h3>
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Últimos 30 días
        </span>
      </div>

      <div className="px-4 pt-6 pb-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradCert" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#666" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#666" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="certificados"
              stroke="#00b4d8"
              strokeWidth={2.5}
              fill="url(#gradCert)"
              name="Certificados"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
