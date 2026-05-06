import React from "react";
import { Input, Select, DatePicker, Button } from "antd";
import { Search, X } from "lucide-react";

const { Option } = Select;

const SettlementsFilters = React.memo(function SettlementsFilters({
  selectedMonth,
  searchRaw,
  department,
  role,
  hasActiveFilters,
  departments,
  roles,
  onMonthChange,
  onSearchChange,
  onDepartmentChange,
  onRoleChange,
  onClearFilters,
}) {
  return (
    <div className="bg-surface rounded-[18px] border border-border p-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Month picker */}
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={onMonthChange}
          allowClear={false}
          format="MMMM YYYY"
          className="w-40"
        />

        {/* Divider */}
        <div className="w-px h-7 bg-border shrink-0" />

        {/* Search */}
        <Input
          prefix={<Search size={15} className="text-text/40" />}
          placeholder="Search staff..."
          value={searchRaw}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-52"
          allowClear
        />

        {/* Department */}
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

        {/* Role */}
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

        {/* Clear */}
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

export default SettlementsFilters;
