import { memo } from "react";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning",
  },
  processing: {
    label: "Processing",
    className: "bg-primary/10 text-primary",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success",
  },
  failed: {
    label: "Failed",
    className: "bg-danger/10 text-danger",
  },
};

function TransferStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default memo(TransferStatusBadge);
