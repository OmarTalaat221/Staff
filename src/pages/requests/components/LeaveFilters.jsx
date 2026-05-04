import { memo } from "react";
import { Input, Select, Button } from "antd";
import { Search, X } from "lucide-react";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function LeaveFilters({
  search,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  leaveTypes,
  hasActiveFilters,
  onClearFilters,
}) {
  const typeOptions = [{ value: "", label: "All Types" }, ...leaveTypes];

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name, role, or reason..."
          prefix={<Search size={16} className="text-text/30" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="sm:max-w-[320px]"
          style={{ height: 42 }}
        />

        <Select
          value={filterType}
          onChange={onTypeChange}
          options={typeOptions}
          className="sm:w-[180px]"
          style={{ height: 42 }}
        />

        <Select
          value={filterStatus}
          onChange={onStatusChange}
          options={statusOptions}
          className="sm:w-[160px]"
          style={{ height: 42 }}
        />

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            icon={<X size={14} />}
            className="flex items-center gap-1"
            style={{ height: 42 }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(LeaveFilters);
