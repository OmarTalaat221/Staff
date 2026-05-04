import React from "react";
import { AlertTriangle, ArrowUp, Minus } from "lucide-react";

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    className: "bg-danger/10 text-danger",
    icon: AlertTriangle,
  },
  high: {
    label: "High",
    className: "bg-warning/10 text-warning",
    icon: ArrowUp,
  },
  normal: {
    label: "Normal",
    className: "bg-secondary/10 text-secondary",
    icon: Minus,
  },
};

const PriorityBadge = React.memo(({ priority }) => {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
});

PriorityBadge.displayName = "PriorityBadge";

export default PriorityBadge;
