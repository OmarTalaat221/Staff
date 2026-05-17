import { memo, useMemo } from "react";
import { Input, Select, Button } from "antd";
import { Search, X } from "lucide-react";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

function TransferFilters({
  search,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  filterMethod,
  onMethodChange,
  filterStaffId,
  onStaffChange,
  transferTypes,
  paymentMethods,
  staffMembers,
  hasActiveFilters,
  onClearFilters,
}) {
  const typeOptions = [{ value: "", label: "All Types" }, ...transferTypes];
  const methodOptions = [
    { value: "", label: "All Methods" },
    ...paymentMethods,
  ];

  const staffOptions = useMemo(
    () => [
      { value: "", label: "All Staff" },
      ...staffMembers.map((s) => ({
        value: s.id,
        label: `${s.name} — ${s.role}`,
      })),
    ],
    [staffMembers]
  );

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Input
          placeholder="Search by name, reference, or note..."
          prefix={<Search size={16} className="text-text/30" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="sm:max-w-[300px]"
          style={{ height: 42 }}
        />

        <Select
          value={filterStaffId || ""}
          onChange={onStaffChange}
          options={staffOptions}
          placeholder="All Staff"
          className="sm:w-[200px]"
          style={{ height: 42 }}
          showSearch
          optionFilterProp="label"
        />

        <Select
          value={filterType}
          onChange={onTypeChange}
          options={typeOptions}
          className="sm:w-[150px]"
          style={{ height: 42 }}
        />

        <Select
          value={filterStatus}
          onChange={onStatusChange}
          options={statusOptions}
          className="sm:w-[155px]"
          style={{ height: 42 }}
        />

        <Select
          value={filterMethod}
          onChange={onMethodChange}
          options={methodOptions}
          className="sm:w-[165px]"
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

export default memo(TransferFilters);
