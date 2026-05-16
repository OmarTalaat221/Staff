import { memo } from "react";
import { Modal, Avatar, Button } from "antd";
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  CalendarDays,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffStatusBadge from "./StaffStatusBadge";

const InfoRow = memo(function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
        <Icon size={16} className="text-text/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text/50 text-xs">{label}</p>
        <p className="text-text text-sm font-medium">{value}</p>
      </div>
    </div>
  );
});

const StaffViewModal = memo(function StaffViewModal({ open, staff, onClose }) {
  if (!open) return null;
  if (!staff) return null;

  const navigate = useNavigate();

  const handleOpenProfile = () => {
    onClose();
    navigate(`/staff/${staff.id}`);
  };

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
              backgroundColor: "#84B067",
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
          {console.log("staff", staff)}
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

        <div className="mt-5 pt-4 border-t border-border flex justify-end">
          <Button
            type="primary"
            icon={<ExternalLink size={15} />}
            onClick={handleOpenProfile}
          >
            View Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
});

export default StaffViewModal;
