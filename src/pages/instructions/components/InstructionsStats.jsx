import React from "react";
import {
  FileText,
  AlertTriangle,
  ArrowUp,
  Minus,
  LayoutGrid,
} from "lucide-react";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total SOPs",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    getValue: (s) => s.total,
  },
  {
    key: "critical",
    label: "Critical",
    icon: AlertTriangle,
    color: "text-danger",
    bgColor: "bg-danger/10",
    getValue: (s) => s.critical,
  },
  {
    key: "high",
    label: "High Priority",
    icon: ArrowUp,
    color: "text-warning",
    bgColor: "bg-warning/10",
    getValue: (s) => s.high,
  },
  {
    key: "normal",
    label: "Normal",
    icon: Minus,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    getValue: (s) => s.normal,
  },
  {
    key: "categories",
    label: "Categories",
    icon: LayoutGrid,
    color: "text-primary",
    bgColor: "bg-primary/10",
    getValue: (s) => s.categories,
  },
];

const InstructionsStats = React.memo(({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-[18px] border border-border bg-surface p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-text/50 uppercase tracking-wide">
              {card.label}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${card.bgColor}`}
            >
              <card.icon size={16} className={card.color} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{card.getValue(stats)}</p>
        </div>
      ))}
    </div>
  );
});

InstructionsStats.displayName = "InstructionsStats";

export default InstructionsStats;
