import { memo } from "react";
import { TreePalm } from "lucide-react";
import dayjs from "dayjs";

const TYPE_CONFIG = {
  annual: { label: "Annual", className: "bg-primary/10 text-primary" },
  sick: { label: "Sick", className: "bg-danger/10 text-danger" },
  personal: { label: "Personal", className: "bg-secondary/10 text-secondary" },
  unpaid: { label: "Unpaid", className: "bg-text/10 text-text/60" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-danger/10 text-danger" },
};

const LeavesTab = memo(function LeavesTab({ leaves }) {
  if (!leaves.length) {
    return (
      <div className="bg-surface border border-border rounded-[18px] p-10 text-center">
        <TreePalm size={36} className="text-text/20 mx-auto mb-3" />
        <p className="text-text/50 text-sm">No leave requests found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-text font-semibold text-sm">Leave Requests</h3>
        <p className="text-text/50 text-xs mt-0.5">{leaves.length} requests</p>
      </div>

      <div className="divide-y divide-border">
        {leaves.map((leave) => {
          const type = TYPE_CONFIG[leave.type] || TYPE_CONFIG.personal;
          const status = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
          return (
            <div
              key={leave.id}
              className="px-5 py-4 flex flex-wrap items-center gap-3"
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
                <p className="text-text text-sm font-medium">
                  {dayjs(leave.startDate).format("DD MMM YYYY")} –{" "}
                  {dayjs(leave.endDate).format("DD MMM YYYY")}
                </p>
                <p className="text-text/50 text-xs mt-0.5">{leave.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-text font-bold text-lg">{leave.days}</p>
                <p className="text-text/50 text-xs">days</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default LeavesTab;
