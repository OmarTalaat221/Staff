import React from "react";
import { Smartphone, HandPlatter, ChefHat, ShieldCheck, Video } from "lucide-react";

const CATEGORY_CONFIG = {
  "app guide": {
    label: "App Guide",
    className: "bg-primary/10 text-primary",
    icon: Smartphone,
  },
  "app": {
    label: "App Guide",
    className: "bg-primary/10 text-primary",
    icon: Smartphone,
  },
  "service": {
    label: "Service",
    className: "bg-secondary/10 text-secondary",
    icon: HandPlatter,
  },
  "kitchen": {
    label: "Kitchen",
    className: "bg-warning/10 text-warning",
    icon: ChefHat,
  },
  "safety": {
    label: "Safety",
    className: "bg-danger/10 text-danger",
    icon: ShieldCheck,
  },
};

const CategoryBadge = React.memo(({ category }) => {
  const normalizedKey = String(category || "").toLowerCase().trim();
  const config = CATEGORY_CONFIG[normalizedKey] || {
    label: category || "Training",
    className: "bg-text/10 text-text/80",
    icon: Video,
  };

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
