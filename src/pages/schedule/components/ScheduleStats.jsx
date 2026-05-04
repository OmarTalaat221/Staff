import { Card } from "antd";
import { CalendarDays, Users, Clock, Zap } from "lucide-react";

const statCards = (stats) => [
  {
    title: "Total Shifts",
    value: stats.totalShifts,
    subtitle: "This week",
    icon: CalendarDays,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Staff Scheduled",
    value: stats.uniqueStaff,
    subtitle: "Unique members",
    icon: Users,
    bg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    title: "Total Hours",
    value: stats.totalHours,
    subtitle: "Work hours this week",
    icon: Clock,
    bg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    title: "Today's Shifts",
    value: stats.todayShifts,
    subtitle: "Active now",
    icon: Zap,
    bg: "bg-danger/10",
    iconColor: "text-danger",
  },
];

export default function ScheduleStats({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards(stats).map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border!">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.bg} flex-shrink-0`}>
                <Icon size={20} className={card.iconColor} />
              </div>
              <div>
                <p className="text-xs text-text/50 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-text">{card.value}</p>
                <p className="text-xs text-text/40">{card.subtitle}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
