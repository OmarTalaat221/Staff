import React from "react";
import { UserCheck, Clock, UserX, Timer } from "lucide-react";

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
        <p className="text-xl font-bold text-text mt-0.5">{value}</p>
      </div>
    </div>
  );
});

const AttendanceStats = React.memo(function AttendanceStats({ stats }) {
  const cards = [
    {
      icon: UserCheck,
      label: "Present",
      value: stats.present,
      color: "#16A34A",
    },
    { icon: Clock, label: "Late", value: stats.late, color: "#D97706" },
    { icon: UserX, label: "Absent", value: stats.absent, color: "#DC2626" },
    {
      icon: Timer,
      label: "Worked Hours",
      value: stats.workedHours,
      color: "#84B067",
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

export default AttendanceStats;
