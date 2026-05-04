import { Modal, Button } from "antd";
import { AlertTriangle } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

export default function TransferDeleteModal({
  open,
  onClose,
  onConfirm,
  transfer,
  loading,
}) {
  if (!transfer) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={420}
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-danger" />
        </div>

        <h3 className="text-lg font-bold text-text">Delete Transfer</h3>

        <p className="text-sm text-text/60 mt-2">
          Are you sure you want to delete this transfer for{" "}
          <span className="font-semibold text-text">{transfer.staffName}</span>{" "}
          ({formatCurrency(transfer.amount)})? This action cannot be undone.
        </p>

        <p className="text-xs text-text/40 mt-1 font-mono">
          Ref: {transfer.reference}
        </p>

        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={onClose} style={{ height: 44, minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            onClick={onConfirm}
            loading={loading}
            style={{ height: 44, minWidth: 100 }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
