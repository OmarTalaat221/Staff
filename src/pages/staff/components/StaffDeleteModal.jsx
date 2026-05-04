import { memo } from "react";
import { Modal } from "antd";
import { AlertTriangle } from "lucide-react";

const StaffDeleteModal = memo(function StaffDeleteModal({
  open,
  staff,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open) return null;
  if (!staff) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={420}
      title={null}
      closable={false}
      okText="Delete"
      cancelText="Cancel"
      onOk={onConfirm}
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      destroyOnClose
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-danger" />
        </div>

        <h3 className="text-text text-lg font-semibold">Delete Staff Member</h3>

        <p className="text-text/60 text-sm mt-2 max-w-[300px]">
          Are you sure you want to delete{" "}
          <span className="text-text font-semibold">{staff.name}</span>? This
          action cannot be undone.
        </p>
      </div>
    </Modal>
  );
});

export default StaffDeleteModal;
