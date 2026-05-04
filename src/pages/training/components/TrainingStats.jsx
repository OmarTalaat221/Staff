import React from "react";
import { Video, Star, Smartphone, LayoutGrid, Clock3 } from "lucide-react";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Videos",
    icon: Video,
    color: "text-primary",
    bgColor: "bg-primary/10",
    getValue: (stats) => stats.total,
  },
  {
    key: "featured",
    label: "Featured",
    icon: Star,
    color: "text-warning",
    bgColor: "bg-warning/10",
    getValue: (stats) => stats.featured,
  },
  {
    key: "appGuides",
    label: "App Guide",
    icon: Smartphone,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    getValue: (stats) => stats.appGuides,
  },
  {
    key: "categories",
    label: "Categories",
    icon: LayoutGrid,
    color: "text-primary",
    bgColor: "bg-primary/10",
    getValue: (stats) => stats.categories,
  },
  {
    key: "totalDuration",
    label: "Total Duration",
    icon: Clock3,
    color: "text-success",
    bgColor: "bg-success/10",
    getValue: (stats) => stats.totalDuration,
  },
];

const TrainingStats = React.memo(({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-[18px] border border-border bg-surface p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-text/50">
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

TrainingStats.displayName = "TrainingStats";

export default TrainingStats;
