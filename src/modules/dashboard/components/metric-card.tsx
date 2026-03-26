"use client";

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "tertiary" | "secondary" | "error";
}

const ACCENT = {
  primary: {
    icon: "bg-primary-container/30 text-primary",
    trend: "text-primary",
  },
  tertiary: {
    icon: "bg-tertiary-container/30 text-tertiary",
    trend: "text-tertiary",
  },
  secondary: {
    icon: "bg-secondary-container/30 text-secondary",
    trend: "text-secondary",
  },
  error: {
    icon: "bg-error-container/30 text-error",
    trend: "text-error",
  },
};

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accent = "primary",
}: MetricCardProps) {
  const colors = ACCENT[accent];

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? "text-primary" : "text-error"}`}>
            <span className="material-symbols-outlined text-[16px]">
              {trendUp ? "trending_up" : "trending_down"}
            </span>
            {trend}
          </div>
        )}
      </div>
      <div>
        <span className="text-3xl font-black font-headline text-on-surface">{value}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
