import React from "react";
import { Input, Select, Button } from "antd";
import { Search, X } from "lucide-react";

const InstructionsFilters = React.memo(
  ({
    search,
    onSearchChange,
    selectedRole,
    onRoleChange,
    selectedCategory,
    onCategoryChange,
    selectedPriority,
    onPriorityChange,
    hasActiveFilters,
    onClearFilters,
    roles,
    categories,
    priorities,
  }) => {
    return (
      <div className="rounded-[18px] border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search instructions..."
            prefix={<Search size={16} className="text-text/30" />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="sm:max-w-[280px]"
          />

          <Select
            placeholder="Role"
            value={selectedRole}
            onChange={onRoleChange}
            allowClear
            className="w-full sm:w-[160px]"
            options={roles
              .filter((r) => r.key !== "all")
              .map((r) => ({
                value: r.key,
                label: r.label,
              }))}
          />

          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={onCategoryChange}
            allowClear
            className="w-full sm:w-[160px]"
            options={categories.map((c) => ({
              value: c.key,
              label: c.label,
            }))}
          />

          <Select
            placeholder="Priority"
            value={selectedPriority}
            onChange={onPriorityChange}
            allowClear
            className="w-full sm:w-[160px]"
            options={priorities.map((p) => ({
              value: p.key,
              label: p.label,
            }))}
          />

          {hasActiveFilters && (
            <Button
              icon={<X size={14} />}
              onClick={onClearFilters}
              className="shrink-0"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    );
  }
);

InstructionsFilters.displayName = "InstructionsFilters";

export default InstructionsFilters;
