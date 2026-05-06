import { memo, useMemo } from "react";
import { Table, DatePicker, Segmented } from "antd";
import dayjs from "dayjs";
import AttendanceStatusBadge from "../AttendanceStatusBadge";

const PERIOD_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const AttendanceTab = memo(function AttendanceTab({
  filteredAttendance,
  attendanceSummary,
  attendancePeriod,
  attendanceDate,
  onPeriodChange,
  onDateChange,
}) {
  const columns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date) => (
          <span className="text-text text-sm font-medium">
            {dayjs(date).format("ddd, DD MMM")}
          </span>
        ),
      },
      {
        title: "Shift",
        dataIndex: "shiftName",
        key: "shiftName",
        responsive: ["sm"],
        render: (shift, record) =>
          shift ? (
            <div>
              <p className="text-text text-sm font-medium">{shift}</p>
              <p className="text-text/50 text-xs">
                {record.scheduledStart} – {record.scheduledEnd}
              </p>
            </div>
          ) : (
            <span className="text-text/40 text-sm">—</span>
          ),
      },
      {
        title: "Check In",
        dataIndex: "checkIn",
        key: "checkIn",
        responsive: ["md"],
        render: (v) => <span className="text-text text-sm">{v || "—"}</span>,
      },
      {
        title: "Check Out",
        dataIndex: "checkOut",
        key: "checkOut",
        responsive: ["md"],
        render: (v) => <span className="text-text text-sm">{v || "—"}</span>,
      },
      {
        title: "Worked",
        dataIndex: "workedMinutes",
        key: "workedMinutes",
        render: (mins) => {
          if (!mins) return <span className="text-text/40 text-sm">—</span>;
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return (
            <span className="text-text text-sm font-medium">
              {h}h {m}m
            </span>
          );
        },
      },
      {
        title: "Late",
        dataIndex: "lateMinutes",
        key: "lateMinutes",
        responsive: ["lg"],
        render: (mins) =>
          mins > 0 ? (
            <span className="text-warning text-sm">{mins}m</span>
          ) : (
            <span className="text-text/40 text-sm">—</span>
          ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => <AttendanceStatusBadge status={status} />,
      },
    ],
    []
  );

  const summaryCards = [
    {
      label: "Present",
      value: attendanceSummary.present,
      className: "text-success",
    },
    { label: "Late", value: attendanceSummary.late, className: "text-warning" },
    {
      label: "Absent",
      value: attendanceSummary.absent,
      className: "text-danger",
    },
    {
      label: "Worked Hours",
      value: attendanceSummary.totalWorkedFormatted,
      className: "text-primary",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-surface border border-border rounded-[18px] p-4 flex flex-wrap items-center gap-3">
        <Segmented
          options={PERIOD_OPTIONS}
          value={attendancePeriod}
          onChange={onPeriodChange}
        />
        <DatePicker
          value={attendanceDate}
          onChange={onDateChange}
          picker={attendancePeriod === "day" ? "date" : attendancePeriod}
          allowClear={false}
          className="w-44"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, className }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-[18px] p-4"
          >
            <p className="text-text/50 text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${className}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredAttendance}
          rowKey="id"
          pagination={{ pageSize: 14, showSizeChanger: false }}
          scroll={{ x: 600 }}
        />
      </div>
    </div>
  );
});

export default AttendanceTab;
