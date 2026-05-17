import { Modal } from "antd";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import LeaveStatusBadge from "./LeaveStatusBadge";
import LeaveTypeBadge from "./LeaveTypeBadge";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-bg flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-text/50" />
    </div>
    <div>
      <p className="text-xs text-text/50 font-medium">{label}</p>
      <p className="text-sm text-text font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

export default function LeaveViewModal({ open, onClose, leave }) {
  if (!leave) return null;

  const initials = leave.staffName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const reviewIcon =
    leave.status === "approved"
      ? CheckCircle2
      : leave.status === "rejected"
        ? XCircle
        : AlertCircle;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={460}
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-border mb-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
          {initials}
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-bold text-text">{leave.staffName}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-text/60">{leave.staffRole}</span>
            <span className="text-text/30">·</span>
            <LeaveTypeBadge type={leave.type} />
            <LeaveStatusBadge status={leave.status} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow
          icon={Calendar}
          label="Date Range"
          value={`${dayjs(leave.startDate).format("MMM D")} - ${dayjs(leave.endDate).format("MMM D, YYYY")}`}
        />
        <InfoRow
          icon={Clock}
          label="Duration"
          value={`${leave.days} ${leave.days === 1 ? "day" : "days"}`}
        />
        <InfoRow icon={User} label="Staff Member" value={leave.staffName} />
        <InfoRow icon={Briefcase} label="Role" value={leave.staffRole} />

        {leave.reason && (
          <div className="sm:col-span-2">
            <InfoRow icon={FileText} label="Reason" value={leave.reason} />
          </div>
        )}
        {leave.handover && (
          <div className="sm:col-span-2">
            <InfoRow icon={User} label="Handover To" value={leave.handover} />
          </div>
        )}
      </div>

      {/* Review info */}
      {leave.status !== "pending" && (
        <div className="mt-5 pt-5 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={reviewIcon}
              label="Reviewed By"
              value={leave.reviewedBy || "-"}
            />
            <InfoRow
              icon={Calendar}
              label="Reviewed At"
              value={
                leave.reviewedAt
                  ? dayjs(leave.reviewedAt).format("MMM D, YYYY")
                  : "-"
              }
            />

            {leave.reviewNote && (
              <div className="sm:col-span-2">
                <InfoRow
                  icon={FileText}
                  label="Review Note"
                  value={leave.reviewNote}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
