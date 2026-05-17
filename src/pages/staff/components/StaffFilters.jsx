import { memo, useCallback } from "react";
import { Input, Select, Button } from "antd";
import { Search, X } from "lucide-react";
import { ROLES, DEPARTMENTS, STATUSES } from "../useStaffPage";


const roleOptions = ROLES?.map((r) => ({ label: r, value: r }));
const departmentOptions = DEPARTMENTS?.map((d) => ({ label: d, value: d }));
const statusOptions = STATUSES?.map((s) => ({
  label: s === "on-leave" ? "On Leave" : s?.charAt(0)?.toUpperCase() + s?.slice(1),
  value: s,
}));

const StaffFilters = memo(function StaffFilters({
  search,
  setSearch,
  filterRole,
  setFilterRole,
  filterDepartment,
  setFilterDepartment,
  filterStatus,
  setFilterStatus,
  clearFilters,
  hasActiveFilters,
}) {
  const handleSearchChange = useCallback(
    (e) => setSearch(e.target.value),
    [setSearch]
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      <Input
        placeholder="Search staff..."
        value={search}
        onChange={handleSearchChange}
        prefix={<Search size={16} className="text-text/40" />}
        allowClear
        className="w-full sm:w-64"
      />

      <Select
        placeholder="Role"
        value={filterRole}
        onChange={setFilterRole}
        allowClear
        className="w-full sm:w-40"
        options={roleOptions}
      />

      <Select
        placeholder="Department"
        value={filterDepartment}
        onChange={setFilterDepartment}
        allowClear
        className="w-full sm:w-44"
        options={departmentOptions}
      />

      <Select
        placeholder="Status"
        value={filterStatus}
        onChange={setFilterStatus}
        allowClear
        className="w-full sm:w-36"
        options={statusOptions}
      />

      {hasActiveFilters && (
        <Button
          type="text"
          icon={<X size={14} />}
          onClick={clearFilters}
          className="text-text/60"
        >
          Clear
        </Button>
      )}
    </div>
  );
});

export default StaffFilters;
