import { memo } from "react";
import { Avatar } from "antd";
import { ArrowLeft, Mail, Phone, CalendarDays, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffStatusBadge from "../../components/StaffStatusBadge";

const ProfileHeader = memo(function ProfileHeader({ staff }) {
  const navigate = useNavigate();

  const infoItems = [
    { icon: Mail, label: "Email", value: staff.email },
    { icon: Phone, label: "Phone", value: staff.phone },
    { icon: CalendarDays, label: "Join Date", value: staff.joinDate },
    {
      icon: Banknote,
      label: "Base Salary",
      value: `${staff.salary?.toLocaleString()} EGP / month`,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-[18px] p-6">
      <button
        onClick={() => navigate("/staff")}
        className="flex items-center gap-2 text-text/60 hover:text-text text-sm mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Staff
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar
          size={72}
          style={{
            backgroundColor: "#84B067",
            fontSize: 28,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {staff.name.charAt(0)}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-text text-2xl font-bold leading-tight">
              {staff.name}
            </h1>
            <StaffStatusBadge status={staff.status} />
          </div>
          <p className="text-text/60 text-sm">
            {staff.role} — {staff.department}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
              <Icon size={15} className="text-text/50" />
            </div>
            <div className="min-w-0">
              <p className="text-text/50 text-xs">{label}</p>
              <p className="text-text text-sm font-medium truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProfileHeader;
