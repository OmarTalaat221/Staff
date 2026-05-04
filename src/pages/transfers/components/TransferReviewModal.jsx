import { useState } from "react";
import { Modal, Button, Input } from "antd";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import TransferTypeBadge from "./TransferTypeBadge";
import { branchLabelMap } from "../useTransfers";

export default function TransferReviewModal({
  open,
  onClose,
  onAction,
  transfer,
  loading,
}) {
  const [note, setNote] = useState("");

  if (!transfer) return null;

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
        <h3 className="text-lg font-bold text-text">Review Transfer</h3>
        <p className="text-sm text-text/50 mt-1">
          Approve or reject this transfer request
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-bg/40 p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {transfer.staffName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold text-text">
              {transfer.staffName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text/50">{transfer.staffRole}</span>
              <TransferTypeBadge type={transfer.transferType} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="text-xs text-text/50">Transfer</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text font-medium">
                {branchLabelMap[transfer.fromBranch] || transfer.fromBranch}
              </span>
              <ArrowRight size={14} className="text-text/30" />
              <span className="text-text font-medium">
                {branchLabelMap[transfer.toBranch] || transfer.toBranch}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-text/50">Effective Date</p>
            <p className="text-text font-medium mt-0.5">
              {dayjs(transfer.effectiveDate).format("MMM D, YYYY")}
              {transfer.endDate &&
                ` - ${dayjs(transfer.endDate).format("MMM D, YYYY")}`}
            </p>
          </div>

          {transfer.reason && (
            <div>
              <p className="text-xs text-text/50">Reason</p>
              <p className="text-text font-medium mt-0.5">{transfer.reason}</p>
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
