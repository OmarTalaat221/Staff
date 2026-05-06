import { memo } from "react";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    className: "bg-success/10 text-success",
  },
  late: {
    label: "Late",
    className: "bg-warning/10 text-warning",
  },
  absent: {
    label: "Absent",
    className: "bg-danger/10 text-danger",
  },
  "on-leave": {
    label: "On Leave",
    className: "bg-secondary/10 text-secondary",
  },
  off: {
    label: "Off",
    className: "bg-text/10 text-text/60",
  },
};

const AttendanceStatusBadge = memo(function AttendanceStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.off;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
});

export default AttendanceStatusBadge;
