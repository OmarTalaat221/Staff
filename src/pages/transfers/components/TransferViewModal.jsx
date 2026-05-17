import { Modal } from "antd";
import {
  Calendar,
  DollarSign,
  User,
  Briefcase,
  FileText,
  CreditCard,
  Hash,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import TransferStatusBadge from "./TransferStatusBadge";
import TransferTypeBadge from "./TransferTypeBadge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

const methodLabels = {
  "bank-transfer": "Bank Transfer",
  cash: "Cash",
  wallet: "E-Wallet",
};

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

export default function TransferViewModal({ open, onClose, transfer }) {
  if (!transfer) return null;

  const initials = transfer.staffName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <h3 className="text-lg font-bold text-text">{transfer.staffName}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-text/60">{transfer.staffRole}</span>
            <span className="text-text/30">·</span>
            <TransferTypeBadge type={transfer.type} />
            <TransferStatusBadge status={transfer.status} />
          </div>
        </div>
      </div>

      {/* Amount highlight */}
      <div className="rounded-2xl border border-border bg-bg/40 p-4 mb-5 text-center">
        <p className="text-xs text-text/50 font-medium">
          {transfer.type === "deduction"
            ? "Deduction Amount"
            : "Transfer Amount"}
        </p>
        <p
          className={`text-2xl font-bold mt-1 ${
            transfer.type === "deduction" ? "text-danger" : "text-text"
          }`}
        >
          {transfer.type === "deduction" ? "-" : ""}
          {formatCurrency(transfer.amount)}
        </p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon={User} label="Staff Member" value={transfer.staffName} />
        <InfoRow icon={Briefcase} label="Role" value={transfer.staffRole} />
        <InfoRow
          icon={CreditCard}
          label="Payment Method"
          value={methodLabels[transfer.method] || transfer.method}
        />
        <InfoRow icon={Hash} label="Reference" value={transfer.reference} />
        <InfoRow
          icon={Calendar}
          label="Month"
          value={dayjs(transfer.month).format("MMMM YYYY")}
        />
        <InfoRow
          icon={Clock}
          label="Created"
          value={dayjs(transfer.createdAt).format("MMM D, YYYY")}
        />

        {transfer.completedAt && (
          <InfoRow
            icon={Calendar}
            label="Completed"
            value={dayjs(transfer.completedAt).format("MMM D, YYYY")}
          />
        )}

        {transfer.note && (
          <div className="sm:col-span-2">
            <InfoRow icon={FileText} label="Note" value={transfer.note} />
          </div>
        )}

        {transfer.attachment && (
          <div className="sm:col-span-2 mt-2">
            <p className="text-xs text-text/50 font-medium mb-1.5">Receipt Attachment</p>
            <div className="rounded-2xl border border-border overflow-hidden bg-bg/20 p-2 flex items-center justify-center">
              <img
                src={`https://camp-coding.site/nourstaff/admin/${transfer.attachment}`}
                alt="Receipt"
                className="max-h-56 rounded-xl object-contain w-full cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => window.open(`https://camp-coding.site/nourstaff/admin/${transfer.attachment}`, "_blank")}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
