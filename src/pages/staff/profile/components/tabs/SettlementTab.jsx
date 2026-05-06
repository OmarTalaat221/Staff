import { memo } from "react";
import { DatePicker } from "antd";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

const Row = memo(function Row({ label, value, className = "", prefix = "" }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-text/60 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${className}`}>
        {prefix}
        {value?.toLocaleString()} EGP
      </span>
    </div>
  );
});

const SettlementTab = memo(function SettlementTab({
  settlement,
  settlementMonth,
  onMonthChange,
}) {
  if (!settlement) {
    return (
      <div className="bg-surface border border-border rounded-[18px] p-10 text-center">
        <p className="text-text/50 text-sm">No settlement data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="bg-surface border border-border rounded-[18px] p-4 flex flex-wrap items-center gap-3">
        <span className="text-text/60 text-sm font-medium">
          Settlement Month:
        </span>
        <DatePicker
          picker="month"
          value={settlementMonth}
          onChange={onMonthChange}
          allowClear={false}
          className="w-44"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-[18px] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-text/50 text-xs">Base Salary</p>
            <p className="text-text font-bold text-lg">
              {settlement.baseSalary?.toLocaleString()} EGP
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
            <TrendingDown size={18} className="text-danger" />
          </div>
          <div>
            <p className="text-text/50 text-xs">Total Deductions</p>
            <p className="text-danger font-bold text-lg">
              {settlement.totalDeductions?.toLocaleString()} EGP
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-success" />
          </div>
          <div>
            <p className="text-text/50 text-xs">Net Payable</p>
            <p className="text-success font-bold text-lg">
              {settlement.netAmount?.toLocaleString()} EGP
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="text-text font-semibold text-sm mb-1">Breakdown</h3>
        <p className="text-text/50 text-xs mb-4">
          Worked {settlement.workedDays} days · {settlement.workedHours} /{" "}
          {settlement.expectedHours} expected
        </p>

        <div className="divide-y divide-border">
          <Row
            label="Base Salary"
            value={settlement.baseSalary}
            className="text-text"
          />

          {settlement.bonusAmount > 0 && (
            <Row
              label="Bonus"
              value={settlement.bonusAmount}
              className="text-success"
              prefix="+"
            />
          )}
          {settlement.reimbursementAmount > 0 && (
            <Row
              label="Reimbursement"
              value={settlement.reimbursementAmount}
              className="text-success"
              prefix="+"
            />
          )}

          {settlement.absenceDeduction > 0 && (
            <Row
              label={`Absence Deduction (${settlement.absentDays} days)`}
              value={settlement.absenceDeduction}
              className="text-danger"
              prefix="−"
            />
          )}
          {settlement.advanceAmount > 0 && (
            <Row
              label="Advance"
              value={settlement.advanceAmount}
              className="text-danger"
              prefix="−"
            />
          )}
          {settlement.deductionAmount > 0 && (
            <Row
              label="Other Deductions"
              value={settlement.deductionAmount}
              className="text-danger"
              prefix="−"
            />
          )}
        </div>

        <div className="mt-4 pt-4 border-t-2 border-border flex items-center justify-between">
          <span className="text-text font-bold text-base">Net Payable</span>
          <span className="text-success font-bold text-xl">
            {settlement.netAmount?.toLocaleString()} EGP
          </span>
        </div>
      </div>
    </div>
  );
});

export default SettlementTab;
