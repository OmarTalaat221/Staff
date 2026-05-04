import { memo } from "react";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning",
  },
  approved: {
    label: "Approved",
    className: "bg-success/10 text-success",
  },
  rejected: {
    label: "Rejected",
    className: "bg-danger/10 text-danger",
  },
  paid: {
    label: "Paid",
    className: "bg-primary/10 text-primary",
  },
};

function AdvanceStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default memo(AdvanceStatusBadge);
