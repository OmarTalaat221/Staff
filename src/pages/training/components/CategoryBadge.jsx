import React from "react";
import { Smartphone, HandPlatter, ChefHat, ShieldCheck } from "lucide-react";

const CATEGORY_CONFIG = {
  app: {
    label: "App Guide",
    className: "bg-primary/10 text-primary",
    icon: Smartphone,
  },
  service: {
    label: "Service",
    className: "bg-secondary/10 text-secondary",
    icon: HandPlatter,
  },
  kitchen: {
    label: "Kitchen",
    className: "bg-warning/10 text-warning",
    icon: ChefHat,
  },
  safety: {
    label: "Safety",
    className: "bg-danger/10 text-danger",
    icon: ShieldCheck,
  },
};

const CategoryBadge = React.memo(({ category }) => {
  const config = CATEGORY_CONFIG[category];
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

CategoryBadge.displayName = "CategoryBadge";

export default CategoryBadge;
