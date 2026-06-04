import React from "react";
import { Table, Pagination } from "antd";

const Initials = React.memo(function Initials({ name }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: "#84B067" }}
    >
      {letters.toUpperCase()}
    </div>
  );
});

const columns = [
  {
    title: "Staff Member",
    key: "staff",
    width: 220,
    fixed: "left",
    render: (_, r) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <Initials name={r.name} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-text truncate leading-tight">
            {r.name}
          </p>
          <p className="text-xs text-text/50 truncate mt-0.5 leading-none">
            {r.role} · {r.department}
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Scheduled Shifts",
    dataIndex: ["attendance_counts", "total_scheduled"],
    key: "scheduled",
    width: 130,
    align: "center",
    render: (v) => <span className="text-sm font-semibold text-text">{v}</span>,
  },
  {
    title: "Attended Shifts",
    dataIndex: ["attendance_counts", "total_attended"],
    key: "attended",
    width: 130,
    align: "center",
    render: (v) => <span className="text-sm font-bold text-success">{v}</span>,
  },
  {
    title: "Absent Shifts",
    dataIndex: ["attendance_counts", "total_absent"],
    key: "absent",
    width: 120,
    align: "center",
    render: (v) => (
      <span className={`text-sm font-bold ${v > 0 ? "text-danger" : "text-text/30"}`}>
        {v}
      </span>
    ),
  },
  {
    title: "Late Arrival",
    dataIndex: ["stats_formatted", "late_arrival"],
    key: "late",
    width: 110,
    align: "center",
    render: (v) => (
      <span className={`text-sm font-semibold ${v !== "0m" ? "text-warning" : "text-text/30"}`}>
        {v}
      </span>
    ),
  },
  {
    title: "Early Arrival",
    dataIndex: ["stats_formatted", "early_arrival"],
    key: "early_arr",
    width: 110,
    align: "center",
    render: (v) => (
      <span className={`text-sm font-semibold ${v !== "0m" ? "text-success/80" : "text-text/30"}`}>
        {v}
      </span>
    ),
  },
  {
    title: "Overtime",
    dataIndex: ["stats_formatted", "overtime"],
    key: "overtime",
    width: 110,
    align: "center",
    render: (v) => (
      <span className={`text-sm font-semibold ${v !== "0m" ? "text-success" : "text-text/30"}`}>
        {v}
      </span>
    ),
  },
  {
    title: "Early Departure",
    dataIndex: ["stats_formatted", "early_departure"],
    key: "early_dep",
    width: 120,
    align: "center",
    render: (v) => (
      <span className={`text-sm font-semibold ${v !== "0m" ? "text-danger/80" : "text-text/30"}`}>
        {v}
      </span>
    ),
  },
  {
    title: "Balance",
    key: "balance",
    width: 120,
    align: "center",
    fixed: "right",
    render: (_, r) => {
      const balance = r.stats_minutes?.balance || 0;
      const formatted = r.stats_formatted?.balance || "0m";
      const isPositive = balance > 0;
      const isNegative = balance < 0;
      let badgeStyle = "text-text/40 bg-text/5 border-text/10";
      if (isPositive) badgeStyle = "text-success bg-success/5 border-success/15 font-bold";
      if (isNegative) badgeStyle = "text-danger bg-danger/5 border-danger/15 font-bold";

      return (
        <span className={`text-xs px-2.5 py-1 rounded-full border ${badgeStyle}`}>
          {formatted}
        </span>
      );
    },
  },
];

export default function AttendanceStatsTable({
  records,
  total,
  page,
  pageSize,
  onPageChange,
  loading,
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table
          dataSource={records}
          columns={columns}
          rowKey="employee_id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1100 }}
          size="middle"
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <p className="text-text/50 text-sm font-semibold">No employee statistics found</p>
                <p className="text-text/30 text-xs mt-1">Try adjusting your filters or search keywords</p>
              </div>
            ),
          }}
          rowClassName="hover:bg-bg/40 transition-colors"
        />
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg/10">
          <p className="text-xs text-text/50 font-semibold">
            Showing{" "}
            <span className="font-bold text-text">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-bold text-text">{total}</span> employees
          </p>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
}
