import { memo } from "react";

const typeConfig = {
  salary: {
    label: "Salary",
    className: "bg-primary/10 text-primary",
  },
  bonus: {
    label: "Bonus",
    className: "bg-success/10 text-success",
  },
  advance: {
    label: "Advance",
    className: "bg-warning/10 text-warning",
  },
  deduction: {
    label: "Deduction",
    className: "bg-danger/10 text-danger",
  },
  reimbursement: {
    label: "Reimbursement",
    className: "bg-secondary/10 text-secondary",
  },
};

function TransferTypeBadge({ type }) {
  const config = typeConfig[type] || typeConfig.salary;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default memo(TransferTypeBadge);
