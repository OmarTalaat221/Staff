import React from "react";
import { Input, Select, DatePicker, Button } from "antd";
import { Search, X } from "lucide-react";
import dayjs from "dayjs";

const { Option } = Select;

const PERIOD_OPTIONS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "on-leave", label: "On Leave" },
];

const AttendanceFilters = React.memo(function AttendanceFilters({
  period,
  selectedDate,
  searchRaw,
  department,
  role,
  statusFilter,
  hasActiveFilters,
  departments,
  roles,
  onPeriodChange,
  onDateChange,
  onSearchChange,
  onDepartmentChange,
  onRoleChange,
  onStatusChange,
  onClearFilters,
}) {
  return (
    <div className="bg-surface rounded-[18px] border border-border p-4 space-y-4">
      {/* Row 1 — Period + Date */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-xl border border-border overflow-hidden shrink-0">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onPeriodChange(opt.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === opt.key
                  ? "bg-primary text-white"
                  : "bg-surface text-text/60 hover:bg-bg"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {period === "day" && (
          <DatePicker
            value={selectedDate}
            onChange={(d) => onDateChange(d || dayjs())}
            allowClear={false}
            format="DD MMM YYYY"
            className="w-44"
          />
        )}
        {period === "week" && (
          <DatePicker
            picker="week"
            value={selectedDate}
            onChange={(d) => onDateChange(d || dayjs())}
            allowClear={false}
            format="[Week of] DD MMM"
            className="w-48"
          />
        )}
        {period === "month" && (
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(d) => onDateChange(d || dayjs())}
            allowClear={false}
            format="MMMM YYYY"
            className="w-40"
          />
        )}
      </div>

      {/* Row 2 — Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<Search size={15} className="text-text/40" />}
          placeholder="Search staff..."
          value={searchRaw}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-52"
          allowClear
        />

        <Select
          placeholder="Department"
          value={department || undefined}
          onChange={onDepartmentChange}
          allowClear
          className="w-40"
        >
          {departments.map((d) => (
            <Option key={d} value={d}>
              {d}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Role"
          value={role || undefined}
          onChange={onRoleChange}
          allowClear
          className="w-36"
        >
          {roles.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Status"
          value={statusFilter || undefined}
          onChange={onStatusChange}
          allowClear
          className="w-36"
        >
          {STATUS_OPTIONS.map((s) => (
            <Option key={s.value} value={s.value}>
              {s.label}
            </Option>
          ))}
        </Select>

        {hasActiveFilters && (
          <Button
            icon={<X size={14} />}
            onClick={onClearFilters}
            className="text-text/60"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
});

export default AttendanceFilters;
