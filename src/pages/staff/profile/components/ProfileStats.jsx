import { memo } from "react";
import { Clock, CalendarX, TrendingUp, CalendarCheck } from "lucide-react";

const statCards = [
  {
    key: "todayHours",
    label: "Today",
    icon: Clock,
    color: "bg-primary/10 text-primary",
  },
  {
    key: "weekHours",
    label: "This Week",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
  },
  {
    key: "monthHours",
    label: "This Month",
    icon: CalendarCheck,
    color: "bg-secondary/10 text-secondary",
  },
  {
    key: "absentDays",
    label: "Absent Days",
    icon: CalendarX,
    color: "bg-danger/10 text-danger",
    suffix: " days",
  },
];

const ProfileStats = memo(function ProfileStats({ overviewStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = overviewStats[card.key];
        return (
          <div
            key={card.key}
            className="bg-surface border border-border rounded-[18px] p-4 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-text/60 text-xs">{card.label}</p>
              <p className="text-text text-lg font-bold leading-tight">
                {value}
                {card.suffix || ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ProfileStats;
