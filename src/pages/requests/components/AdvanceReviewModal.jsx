import { useState } from "react";
import { Modal, Button, Input } from "antd";
import { CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import AdvanceStatusBadge from "./AdvanceStatusBadge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

const repaymentLabels = {
  "salary-deduction": "Salary Deduction",
  installments: "Monthly Installments",
  "one-time": "One-Time Payment",
};

export default function AdvanceReviewModal({
  open,
  onClose,
  onAction,
  advance,
  loading,
}) {
  const [note, setNote] = useState("");

  if (!advance) return null;

  const handleAction = (action) => {
    onAction(action, note);
    setNote("");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={480}
    >
      <div className="pb-5 border-b border-border mb-5">
        <h3 className="text-lg font-bold text-text">Review Advance Request</h3>
        <p className="text-sm text-text/50 mt-1">
          Approve or reject this cash advance request
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-bg/40 p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
            {advance.staffName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold text-text">
              {advance.staffName}
            </p>
            <span className="text-xs text-text/50">{advance.staffRole}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-text/50">Amount</p>
            <p className="text-text font-bold mt-0.5">
              {formatCurrency(advance.amount)}
            </p>
          </div>

          <div>
            <p className="text-xs text-text/50">Repayment</p>
            <p className="text-text font-medium mt-0.5">
              {repaymentLabels[advance.repaymentMethod]}
            </p>
          </div>

          {advance.reason && (
            <div className="col-span-2">
              <p className="text-xs text-text/50">Reason</p>
              <p className="text-text font-medium mt-0.5">{advance.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="mb-5">
        <label className="text-sm font-medium text-text mb-1.5 block">
          Review Note (optional)
        </label>
        <Input.TextArea
          rows={3}
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button onClick={onClose} style={{ height: 44 }}>
          Cancel
        </Button>

        <Button
          danger
          onClick={() => handleAction("rejected")}
          loading={loading}
          icon={<XCircle size={16} />}
          className="flex items-center gap-1"
          style={{ height: 44 }}
        >
          Reject
        </Button>

        <Button
          type="primary"
          onClick={() => handleAction("approved")}
          loading={loading}
          icon={<CheckCircle2 size={16} />}
          className="flex items-center gap-1"
          style={{
            height: 44,
            backgroundColor: "#16A34A",
            borderColor: "#16A34A",
          }}
        >
          Approve
        </Button>
      </div>
    </Modal>
  );
}
