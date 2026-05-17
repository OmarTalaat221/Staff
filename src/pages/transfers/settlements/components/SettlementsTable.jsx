import React from "react";
import { Table } from "antd";
import { FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../useSettlementsTab";



const Initials = React.memo(function Initials({ name }) {
  const parts = name.trim().split(" ");
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
      style={{ backgroundColor: "#84B067" }}
    >
      {letters.toUpperCase()}
    </div>
  );
});



const NetBadge = React.memo(function NetBadge({ net, base }) {
  const color = net < base ? "text-danger" : "text-success";
  return (
    <span className={`text-sm font-bold ${color}`}>{formatCurrency(net)}</span>
  );
});



const buildColumns = (onViewBreakdown, onViewProfile) => [
  {
    title: "Staff Member",
    key: "staff",
    width: 200,
    fixed: "left",
    render: (_, r) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <Initials name={r.staffName} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate leading-tight">
            {r.staffName}
          </p>
          <p className="text-xs text-text/50 truncate leading-tight">
            {r.staffRole} · {r.department}
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Worked Days",
    dataIndex: "workedDays",
    key: "workedDays",
    width: 110,
    render: (v) => (
      <span className="text-sm text-text font-medium">{v} days</span>
    ),
  },
  {
    title: "Worked Hours",
    dataIndex: "workedHours",
    key: "workedHours",
    width: 120,
    render: (v) => <span className="text-sm text-text">{v}</span>,
  },
  {
    title: "Base Salary",
    dataIndex: "baseSalary",
    key: "baseSalary",
    width: 130,
    render: (v) => (
      <span className="text-sm text-text font-medium">{formatCurrency(v)}</span>
    ),
  },
  {
    title: "Deductions",
    dataIndex: "totalDeductions",
    key: "deductions",
    width: 130,
    render: (v) => (
      <span
        className={`text-sm font-medium ${v > 0 ? "text-danger" : "text-text/30"}`}
      >
        {v > 0 ? `- ${formatCurrency(v)}` : "—"}
      </span>
    ),
  },
  {
    title: "Additions",
    dataIndex: "totalAdditions",
    key: "additions",
    width: 120,
    render: (v) => (
      <span
        className={`text-sm font-medium ${v > 0 ? "text-success" : "text-text/30"}`}
      >
        {v > 0 ? `+ ${formatCurrency(v)}` : "—"}
      </span>
    ),
  },
  {
    title: "Net Payable",
    key: "net",
    width: 130,
    render: (_, r) => <NetBadge net={r.netAmount} base={r.baseSalary} />,
  },
  {
    title: "",
    key: "actions",
    width: 90,
    fixed: "right",
    render: (_, r) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onViewBreakdown(r)}
          className="p-1.5 rounded-lg hover:bg-bg transition-colors text-text/40 hover:text-primary"
          title="View Breakdown"
        >
          <FileText size={15} />
        </button>
        <button
          onClick={() => onViewProfile(r.staffId)}
          className="p-1.5 rounded-lg hover:bg-bg transition-colors text-text/40 hover:text-primary"
          title="View Profile"
        >
          <ExternalLink size={15} />
        </button>
      </div>
    ),
  },
];



const SettlementsTable = React.memo(function SettlementsTable({
  settlements,
  onViewBreakdown,
}) {
  const navigate = useNavigate();

  const handleViewProfile = React.useCallback(
    (staffId) => navigate(`/staff/${staffId}`),
    [navigate]
  );

  const columns = React.useMemo(
    () => buildColumns(onViewBreakdown, handleViewProfile),
    [onViewBreakdown, handleViewProfile]
  );

  return (
    <div className="bg-surface rounded-[18px] border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          dataSource={settlements}
          columns={columns}
          rowKey="staffId"
          pagination={false}
          scroll={{ x: 1050 }}
          size="middle"
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <p className="text-text/50 text-sm">No settlements found</p>
                <p className="text-text/30 text-xs mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ),
          }}
          rowClassName="hover:bg-bg/50 transition-colors"
        />
      </div>

      {settlements.length > 0 && (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-sm text-text/50">
            {settlements.length} staff member
            {settlements.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
});

export default SettlementsTable;
