import { memo } from "react";

const config = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success",
    dot: "bg-success",
  },
  "on-leave": {
    label: "On Leave",
    className: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  inactive: {
    label: "Inactive",
    className: "bg-danger/10 text-danger",
    dot: "bg-danger",
  },
};

const StaffStatusBadge = memo(function StaffStatusBadge({ status }) {
  const c = config[status] || config.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${c.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
});

export default StaffStatusBadge;
