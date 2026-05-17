import React from "react";
import { Table, Pagination } from "antd";
import { ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import { formatMinutes } from "../useAttendanceTab";



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



const buildColumns = (onViewProfile) => [
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
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 120,
    render: (v) => (
      <span className="text-sm text-text">
        {dayjs(v).format("DD MMM YYYY")}
      </span>
    ),
  },
  {
    title: "Shift",
    dataIndex: "shiftName",
    key: "shift",
    width: 100,
    render: (v) => <span className="text-sm text-text">{v || "—"}</span>,
  },
  {
    title: "Check In",
    dataIndex: "checkIn",
    key: "checkIn",
    width: 100,
    render: (v) => (
      <span
        className={`text-sm font-medium ${v ? "text-text" : "text-text/30"}`}
      >
        {v || "—"}
      </span>
    ),
  },
  {
    title: "Check Out",
    dataIndex: "checkOut",
    key: "checkOut",
    width: 110,
    render: (v) => (
      <span
        className={`text-sm font-medium ${v ? "text-text" : "text-text/30"}`}
      >
        {v || "—"}
      </span>
    ),
  },
  {
    title: "Worked",
    dataIndex: "workedMinutes",
    key: "worked",
    width: 100,
    render: (v) => (
      <span className="text-sm text-text font-medium">{formatMinutes(v)}</span>
    ),
  },
  {
    title: "Late",
    dataIndex: "lateMinutes",
    key: "late",
    width: 90,
    render: (v) => (
      <span
        className={`text-sm font-medium ${v > 0 ? "text-warning" : "text-text/30"}`}
      >
        {v > 0 ? `${v}m` : "—"}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (v) => <AttendanceStatusBadge status={v} />,
  },
  {
    title: "",
    key: "action",
    width: 60,
    fixed: "right",
    render: (_, r) => (
      <button
        onClick={() => onViewProfile(r.staffId)}
        className="p-1.5 rounded-lg hover:bg-bg transition-colors text-text/40 hover:text-primary"
        title="View Profile"
      >
        <ExternalLink size={15} />
      </button>
    ),
  },
];



const AttendanceTable = React.memo(function AttendanceTable({
  records,
  total,
  page,
  pageSize,
  onPageChange,
  onViewProfile,
}) {
  const columns = React.useMemo(
    () => buildColumns(onViewProfile),
    [onViewProfile]
  );

  return (
    <div className="bg-surface rounded-[18px] border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
          size="middle"
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <p className="text-text/50 text-sm">
                  No attendance records found
                </p>
                <p className="text-text/30 text-xs mt-1">
                  Try adjusting your filters or period
                </p>
              </div>
            ),
          }}
          rowClassName="hover:bg-bg/50 transition-colors"
        />
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <p className="text-sm text-text/50">
            Showing{" "}
            <span className="font-medium text-text">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-medium text-text">{total}</span> records
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

      {total <= pageSize && total > 0 && (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-sm text-text/50">
            {total} record{total !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
});

export default AttendanceTable;
