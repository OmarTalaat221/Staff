import { memo } from "react";

const typeConfig = {
  annual: {
    label: "Annual",
    className: "bg-primary/10 text-primary",
  },
  sick: {
    label: "Sick",
    className: "bg-danger/10 text-danger",
  },
  personal: {
    label: "Personal",
    className: "bg-secondary/10 text-secondary",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-text/8 text-text/60",
  },
};

function LeaveTypeBadge({ type }) {
  const config = typeConfig[type] || typeConfig.personal;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default memo(LeaveTypeBadge);
