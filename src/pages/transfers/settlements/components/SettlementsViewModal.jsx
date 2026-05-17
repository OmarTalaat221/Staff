import React from "react";
import { Modal, Button } from "antd";
import {
  X,
  ExternalLink,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../useSettlementsTab";



const Row = React.memo(function Row({ label, value, bold, color, dash }) {
  if (dash) {
    return (
      <div className="flex items-center justify-between py-2.5">
        <span className="text-sm text-text/60">{label}</span>
        <span className="text-sm text-text/30">—</span>
      </div>
    );
  }

  const colorClass =
    color === "danger"
      ? "text-danger"
      : color === "success"
        ? "text-success"
        : color === "primary"
          ? "text-primary"
          : color === "secondary"
            ? "text-secondary"
            : "text-text";

  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text/60">{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold" : "font-medium"} ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
});



const Section = React.memo(function Section({
  icon: Icon,
  title,
  color,
  children,
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <p className="text-xs font-semibold text-text/50 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="bg-bg rounded-xl px-4 divide-y divide-border">
        {children}
      </div>
    </div>
  );
});



const SettlementsViewModal = React.memo(function SettlementsViewModal({
  open,
  onClose,
  staff,
}) {
  const navigate = useNavigate();

  if (!staff) return null;

  const initials = staff.staffName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleViewProfile = () => {
    onClose();
    navigate(`/staff/${staff.staffId}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={500}
      closeIcon={<X size={18} />}
      title={
        <div className="flex items-center gap-3 pr-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: "#84B067" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-text leading-tight truncate">
              {staff.staffName}
            </p>
            <p className="text-xs text-text/50 leading-tight mt-0.5">
              {staff.staffRole} · {staff.department}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center gap-3">
          <Button block onClick={onClose}>
            Close
          </Button>
          <Button
            type="primary"
            block
            icon={<ExternalLink size={15} />}
            onClick={handleViewProfile}
            className="flex items-center justify-center gap-2"
          >
            View Full Profile
          </Button>
        </div>
      }
      styles={{
        body: {
          maxHeight: "calc(100vh - 260px)",
          overflowY: "auto",
          paddingRight: 4,
        },
      }}
    >
      <div className="space-y-5">
        {/* Attendance */}
        <Section icon={Calendar} title="Attendance" color="#84B067">
          <Row label="Worked Days" value={`${staff.workedDays} days`} />
          <Row label="Worked Hours" value={staff.workedHours} />
          <Row
            label="Absent Days"
            value={staff.absentDays > 0 ? `${staff.absentDays} days` : null}
            dash={staff.absentDays === 0}
          />
          <Row
            label="On Leave"
            value={staff.onLeaveDays > 0 ? `${staff.onLeaveDays} days` : null}
            dash={staff.onLeaveDays === 0}
          />
        </Section>

        {/* Base Salary */}
        <Section icon={Wallet} title="Base Salary" color="#CA852D">
          <Row
            label="Monthly Salary"
            value={formatCurrency(staff.baseSalary)}
            bold
          />
        </Section>

        {/* Deductions */}
        <Section icon={TrendingDown} title="Deductions" color="#DC2626">
          <Row
            label="Absence Deduction"
            value={
              staff.absenceDeduction > 0
                ? `- ${formatCurrency(staff.absenceDeduction)}`
                : null
            }
            color={staff.absenceDeduction > 0 ? "danger" : undefined}
            dash={staff.absenceDeduction === 0}
          />
          <Row
            label="Cash Advances"
            value={
              staff.advanceAmount > 0
                ? `- ${formatCurrency(staff.advanceAmount)}`
                : null
            }
            color={staff.advanceAmount > 0 ? "danger" : undefined}
            dash={staff.advanceAmount === 0}
          />
          <Row
            label="Other Deductions"
            value={
              staff.deductionAmount > 0
                ? `- ${formatCurrency(staff.deductionAmount)}`
                : null
            }
            color={staff.deductionAmount > 0 ? "danger" : undefined}
            dash={staff.deductionAmount === 0}
          />
          <Row
            label="Total Deductions"
            value={`- ${formatCurrency(staff.totalDeductions)}`}
            bold
            color="danger"
          />
        </Section>

        {/* Additions */}
        <Section icon={TrendingUp} title="Additions" color="#16A34A">
          <Row
            label="Bonuses"
            value={
              staff.bonusAmount > 0
                ? `+ ${formatCurrency(staff.bonusAmount)}`
                : null
            }
            color={staff.bonusAmount > 0 ? "success" : undefined}
            dash={staff.bonusAmount === 0}
          />
          <Row
            label="Reimbursements"
            value={
              staff.reimbursementAmount > 0
                ? `+ ${formatCurrency(staff.reimbursementAmount)}`
                : null
            }
            color={staff.reimbursementAmount > 0 ? "success" : undefined}
            dash={staff.reimbursementAmount === 0}
          />
          <Row
            label="Total Additions"
            value={`+ ${formatCurrency(staff.totalAdditions)}`}
            bold
            color="success"
          />
        </Section>

        {/* Net Payable */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text/50 font-medium uppercase tracking-wide">
              Net Payable
            </p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {formatCurrency(staff.netAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text/40">
              Base: {formatCurrency(staff.baseSalary)}
            </p>
            {staff.netAmount !== staff.baseSalary && (
              <p
                className={`text-xs font-medium mt-0.5 ${staff.netAmount < staff.baseSalary
                    ? "text-danger"
                    : "text-success"
                  }`}
              >
                {staff.netAmount < staff.baseSalary ? "" : "+"}
                {formatCurrency(staff.netAmount - staff.baseSalary)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default SettlementsViewModal;
