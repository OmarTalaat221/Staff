import { memo } from "react";
import { Banknote } from "lucide-react";
import dayjs from "dayjs";

const TYPE_CONFIG = {
  salary: { label: "Salary", className: "bg-primary/10 text-primary" },
  bonus: { label: "Bonus", className: "bg-success/10 text-success" },
  advance: { label: "Advance", className: "bg-warning/10 text-warning" },
  deduction: { label: "Deduction", className: "bg-danger/10 text-danger" },
  reimbursement: {
    label: "Reimbursement",
    className: "bg-secondary/10 text-secondary",
  },
};

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
};

const isDeduction = (type) => type === "deduction" || type === "advance";

const TransfersTab = memo(function TransfersTab({ transfers }) {
  if (!transfers.length) {
    return (
      <div className="bg-surface border border-border rounded-[18px] p-10 text-center">
        <Banknote size={36} className="text-text/20 mx-auto mb-3" />
        <p className="text-text/50 text-sm">No transfers found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-text font-semibold text-sm">Financial Transfers</h3>
        <p className="text-text/50 text-xs mt-0.5">
          {transfers.length} records
        </p>
      </div>

      <div className="divide-y divide-border">
        {transfers.map((transfer) => {
          const type = TYPE_CONFIG[transfer.type] || TYPE_CONFIG.salary;
          const status =
            STATUS_CONFIG[transfer.status] || STATUS_CONFIG.pending;
          const negative = isDeduction(transfer.type);

          return (
            <div
              key={transfer.id}
              className="px-5 py-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${type.className}`}
                  >
                    {type.label}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-text/50 text-xs">
                  {transfer.reference} ·{" "}
                  {dayjs(transfer.createdAt).format("DD MMM YYYY")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`font-bold text-base ${negative ? "text-danger" : "text-success"}`}
                >
                  {negative ? "−" : "+"}
                  {transfer.amount.toLocaleString()} EGP
                </p>
                <p className="text-text/50 text-xs capitalize">
                  {transfer.method.replace("-", " ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TransfersTab;
