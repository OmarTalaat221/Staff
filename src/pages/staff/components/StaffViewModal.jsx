import { memo } from "react";
import { Modal, Avatar } from "antd";
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  CalendarDays,
  Banknote,
} from "lucide-react";
import StaffStatusBadge from "./StaffStatusBadge";

const InfoRow = memo(function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
        <Icon size={16} className="text-text/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text/50 text-xs">{label}</p>
        <p className="text-text text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
});

const StaffViewModal = memo(function StaffViewModal({ open, staff, onClose }) {
  if (!open) return null;
  if (!staff) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      title={null}
      closable
      destroyOnClose
    >
      <div className="pt-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            size={56}
            style={{
              backgroundColor: "#2563EB",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {staff.name.charAt(0)}
          </Avatar>

          <div className="flex-1">
            <h2 className="text-text text-xl font-bold leading-tight">
              {staff.name}
            </h2>
            <p className="text-text/60 text-sm mt-0.5">{staff.role}</p>
          </div>

          <StaffStatusBadge status={staff.status} />
        </div>

        {/* Info Grid */}
        <div className="bg-bg rounded-xl p-4 space-y-4">
          <InfoRow icon={Mail} label="Email" value={staff.email} />
          <InfoRow icon={Phone} label="Phone" value={staff.phone} />
          <InfoRow icon={Briefcase} label="Role" value={staff.role} />
          <InfoRow
            icon={Building2}
            label="Department"
            value={staff.department}
          />
          <InfoRow
            icon={CalendarDays}
            label="Join Date"
            value={staff.joinDate}
          />
          <InfoRow
            icon={Banknote}
            label="Salary"
            value={`${staff.salary?.toLocaleString()} EGP`}
          />
        </div>
      </div>
    </Modal>
  );
});

export default StaffViewModal;
