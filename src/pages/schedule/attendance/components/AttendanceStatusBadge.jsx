import React from "react";

const CONFIG = {
  present: { label: "Present", bg: "bg-success/10", text: "text-success" },
  late: { label: "Late", bg: "bg-warning/10", text: "text-warning" },
  absent: { label: "Absent", bg: "bg-danger/10", text: "text-danger" },
  "on-leave": {
    label: "On Leave",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
};

const AttendanceStatusBadge = React.memo(function AttendanceStatusBadge({
  status,
}) {
  const cfg = CONFIG[status] || {
    label: status,
    bg: "bg-border",
    text: "text-text/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
});

export default AttendanceStatusBadge;
