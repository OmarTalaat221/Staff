import { useState } from "react";
import { Modal, Button, Input } from "antd";
import { CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import LeaveTypeBadge from "./LeaveTypeBadge";

export default function LeaveReviewModal({
  open,
  onClose,
  onAction,
  leave,
  loading,
}) {
  const [note, setNote] = useState("");

  if (!leave) return null;

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
        <h3 className="text-lg font-bold text-text">Review Leave Request</h3>
        <p className="text-sm text-text/50 mt-1">
          Approve or reject this leave request
        </p>
      </div>

      {/* Request summary */}
      <div className="rounded-2xl border border-border bg-bg/40 p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
            {leave.staffName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold text-text">{leave.staffName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text/50">{leave.staffRole}</span>
              <LeaveTypeBadge type={leave.type} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-text/50">Date Range</p>
            <p className="text-text font-medium mt-0.5">
              {dayjs(leave.startDate).format("MMM D")} -{" "}
              {dayjs(leave.endDate).format("MMM D")}
            </p>
          </div>

          <div>
            <p className="text-xs text-text/50">Duration</p>
            <p className="text-text font-medium mt-0.5">
              {leave.days} {leave.days === 1 ? "day" : "days"}
            </p>
          </div>

          {leave.reason && (
            <div className="col-span-2">
              <p className="text-xs text-text/50">Reason</p>
              <p className="text-text font-medium mt-0.5">{leave.reason}</p>
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
          placeholder="Add a note for the staff member..."
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
