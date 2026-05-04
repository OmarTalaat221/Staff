import { Modal } from "antd";
import {
  Calendar,
  DollarSign,
  User,
  Briefcase,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import dayjs from "dayjs";
import AdvanceStatusBadge from "./AdvanceStatusBadge";

const repaymentLabels = {
  "salary-deduction": "Salary Deduction",
  installments: "Monthly Installments",
  "one-time": "One-Time Payment",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

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

export default function AdvanceViewModal({ open, onClose, advance }) {
  if (!advance) return null;

  const initials = advance.staffName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const reviewIcon =
    advance.status === "approved" || advance.status === "paid"
      ? CheckCircle2
      : advance.status === "rejected"
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
          <h3 className="text-lg font-bold text-text">{advance.staffName}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-text/60">{advance.staffRole}</span>
            <span className="text-text/30">·</span>
            <AdvanceStatusBadge status={advance.status} />
          </div>
        </div>
      </div>

      {/* Amount highlight */}
      <div className="rounded-2xl border border-border bg-bg/40 p-4 mb-5 text-center">
        <p className="text-xs text-text/50 font-medium">Requested Amount</p>
        <p className="text-2xl font-bold text-text mt-1">
          {formatCurrency(advance.amount)}
        </p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon={User} label="Staff Member" value={advance.staffName} />
        <InfoRow icon={Briefcase} label="Role" value={advance.staffRole} />
        <InfoRow
          icon={CreditCard}
          label="Repayment"
          value={
            repaymentLabels[advance.repaymentMethod] || advance.repaymentMethod
          }
        />
        <InfoRow
          icon={Calendar}
          label="Requested"
          value={dayjs(advance.requestedAt).format("MMM D, YYYY")}
        />

        {advance.reason && (
          <div className="sm:col-span-2">
            <InfoRow icon={FileText} label="Reason" value={advance.reason} />
          </div>
        )}
      </div>

      {/* Review info */}
      {advance.status !== "pending" && (
        <div className="mt-5 pt-5 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={reviewIcon}
              label="Reviewed By"
              value={advance.reviewedBy || "-"}
            />
            <InfoRow
              icon={Calendar}
              label="Reviewed At"
              value={
                advance.reviewedAt
                  ? dayjs(advance.reviewedAt).format("MMM D, YYYY")
                  : "-"
              }
            />

            {advance.paidAt && (
              <InfoRow
                icon={Wallet}
                label="Paid At"
                value={dayjs(advance.paidAt).format("MMM D, YYYY")}
              />
            )}

            {advance.reviewNote && (
              <div className="sm:col-span-2">
                <InfoRow
                  icon={FileText}
                  label="Review Note"
                  value={advance.reviewNote}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
