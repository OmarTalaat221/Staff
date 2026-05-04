import { Modal, Button } from "antd";
import { AlertTriangle } from "lucide-react";

export default function ShiftDeleteModal({
  open,
  onClose,
  onConfirm,
  shift,
  loading,
}) {
  if (!shift) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={420}
      centered
    >
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <h3 className="text-lg font-bold text-text">Remove Shift</h3>
        <p className="text-sm text-text/60 mt-2 max-w-sm">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-text">{shift.staffName}</span>'s
          shift on <span className="font-semibold text-text">{shift.date}</span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6 w-full">
          <Button block onClick={onClose} style={{ height: 44 }}>
            Cancel
          </Button>
          <Button
            block
            danger
            type="primary"
            loading={loading}
            onClick={onConfirm}
            style={{ height: 44 }}
          >
            Remove Shift
          </Button>
        </div>
      </div>
    </Modal>
  );
}
