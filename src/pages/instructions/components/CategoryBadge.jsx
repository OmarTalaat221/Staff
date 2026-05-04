import React from "react";
import {
  Sunrise,
  HandPlatter,
  ShieldCheck,
  Moon,
  Siren,
  GraduationCap,
} from "lucide-react";

const CATEGORY_CONFIG = {
  opening: {
    label: "Opening",
    className: "bg-warning/10 text-warning",
    icon: Sunrise,
  },
  service: {
    label: "Service",
    className: "bg-primary/10 text-primary",
    icon: HandPlatter,
  },
  hygiene: {
    label: "Hygiene",
    className: "bg-success/10 text-success",
    icon: ShieldCheck,
  },
  closing: {
    label: "Closing",
    className: "bg-text/8 text-text/70",
    icon: Moon,
  },
  emergency: {
    label: "Emergency",
    className: "bg-danger/10 text-danger",
    icon: Siren,
  },
  training: {
    label: "Training",
    className: "bg-secondary/10 text-secondary",
    icon: GraduationCap,
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
