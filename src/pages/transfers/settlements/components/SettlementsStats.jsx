import React from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  BadgeDollarSign,
} from "lucide-react";
import { formatCurrency } from "../useSettlementsTab";

const StatCard = React.memo(function StatCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  return (
    <div className="bg-surface rounded-[18px] border border-border p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text/50 font-medium uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-lg font-bold text-text mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
});

const SettlementsStats = React.memo(function SettlementsStats({ stats }) {
  const cards = [
    {
      icon: Wallet,
      label: "Total Payroll",
      value: formatCurrency(stats.totalPayroll),
      color: "#84B067",
    },
    {
      icon: TrendingDown,
      label: "Total Deductions",
      value: formatCurrency(stats.totalDeductions),
      color: "#DC2626",
    },
    {
      icon: TrendingUp,
      label: "Total Additions",
      value: formatCurrency(stats.totalAdditions),
      color: "#16A34A",
    },
    {
      icon: BadgeDollarSign,
      label: "Net Total",
      value: formatCurrency(stats.netTotal),
      color: "#CA852D",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
});

export default SettlementsStats;
