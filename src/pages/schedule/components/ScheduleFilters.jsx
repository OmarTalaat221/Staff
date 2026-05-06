import { Button, Select } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Plus,
  Coffee,
} from "lucide-react";

const shiftTypeOptions = [
  { value: "morning", label: "Morning (06-14)" },
  { value: "afternoon", label: "Afternoon (14-22)" },
  { value: "evening", label: "Evening (22-06)" },
];

const roleOptions = [
  { value: "Waiter", label: "Waiter" },
  { value: "Chef", label: "Chef" },
  { value: "Cashier", label: "Cashier" },
  { value: "Host", label: "Host" },
  { value: "Delivery", label: "Delivery" },
  { value: "Manager", label: "Manager" },
  { value: "Cleaner", label: "Cleaner" },
];

export default function ScheduleFilters({
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onToday,
  shiftTypeFilter,
  onShiftTypeChange,
  roleFilter,
  onRoleChange,
  hasActiveFilters,
  onClearFilters,
  onAddShift,
  onOpenBreakSettings,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Week nav + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-xl border border-border hover:bg-bg text-text/60 hover:text-text transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-2 rounded-xl border border-border hover:bg-bg text-sm font-medium text-text/70 hover:text-text transition-all flex items-center gap-1.5"
          >
            <CalendarDays size={15} />
            Today
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 rounded-xl border border-border hover:bg-bg text-text/60 hover:text-text transition-all"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-semibold text-text ml-2">
            {weekLabel}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* <Button
            icon={<Coffee size={16} />}
            onClick={onOpenBreakSettings}
            style={{ height: 42 }}
          >
            Break Times
          </Button> */}
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => onAddShift()}
            style={{ height: 42 }}
            className="font-semibold"
          >
            Add Shift
          </Button>
        </div>
      </div>

      {/* Bottom row: Filters */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Select
          placeholder="Shift Type"
          value={shiftTypeFilter || undefined}
          onChange={onShiftTypeChange}
          options={shiftTypeOptions}
          allowClear
          style={{ width: 170, height: 42 }}
        />
        <Select
          placeholder="Role"
          value={roleFilter || undefined}
          onChange={onRoleChange}
          options={roleOptions}
          allowClear
          style={{ width: 130, height: 42 }}
        />
        {hasActiveFilters && (
          <Button
            icon={<X size={14} />}
            onClick={onClearFilters}
            style={{ height: 42 }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
