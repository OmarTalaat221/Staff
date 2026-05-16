import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  Coffee,
  FileText,
  Sun,
  Sunset,
  Moon,
  ExternalLink,
} from "lucide-react";

const shiftIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
};

const shiftLabels = {
  morning: "Morning Shift",
  afternoon: "Afternoon Shift",
  evening: "Evening Shift",
};

const shiftColors = {
  morning: "bg-warning/10 text-warning",
  afternoon: "bg-primary/10 text-primary",
  evening: "bg-secondary/10 text-secondary",
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

export default function ShiftViewModal({ open, onClose, shift }) {
  const navigate = useNavigate();

  if (!shift) return null;

  const ShiftIcon = shiftIcons[shift.shiftType] || Sun;
  const shiftLabel = shiftLabels[shift.shiftType] || "Shift";
  const shiftColor = shiftColors[shift.shiftType] || shiftColors.morning;

  const initials = shift.staffName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleViewProfile = () => {
    onClose?.();
    navigate(`/staff/${shift.staffId}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={440}
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-border mb-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">{shift.staffName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-text/60">{shift.staffRole}</span>
            <span className="text-text/30">·</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${shiftColor}`}
            >
              <ShiftIcon size={12} />
              {shiftLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon={Calendar} label="Date" value={shift.date} />
        <InfoRow
          icon={Clock}
          label="Working Hours"
          value={`${shift.startTime} - ${shift.endTime}`}
        />
        <InfoRow icon={User} label="Staff Member" value={shift.staffName} />
        <InfoRow icon={Briefcase} label="Role" value={shift.staffRole} />
        <InfoRow
          icon={Coffee}
          label="Break Time"
          value={
            shift.breakStart && shift.breakEnd
              ? `${shift.breakStart} - ${shift.breakEnd}`
              : "No break"
          }
        />
        {shift.notes && (
          <InfoRow icon={FileText} label="Notes" value={shift.notes} />
        )}
      </div>

      {/* Action */}
      <div className="pt-5 mt-5 border-t border-border">
        <Button
          type="primary"
          block
          icon={<ExternalLink size={16} />}
          onClick={handleViewProfile}
          className="flex items-center justify-center gap-2"
        >
          View Profile
        </Button>
      </div>
    </Modal>
  );
}
