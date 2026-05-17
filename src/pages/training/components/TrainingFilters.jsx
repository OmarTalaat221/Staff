import React from "react";
import { Button, Input, Select } from "antd";
import { Search, X } from "lucide-react";
import { FEATURE_FILTERS } from "../data/videosData";

const TrainingFilters = React.memo(
  ({
    search,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    featuredFilter,
    onFeaturedFilterChange,
    hasActiveFilters,
    onClearFilters,
    categories,
  }) => {
    return (
      <div className="rounded-[18px] border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search videos..."
            prefix={<Search size={16} className="text-text/30" />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="sm:max-w-[280px]"
          />

          <Select
            value={selectedCategory}
            onChange={onCategoryChange}
            className="w-full sm:w-[180px]"
            options={[
              { value: "all", label: "All Videos" },
              ...categories.map((c) => ({
                value: String(c.category_id),
                label: c.category_name,
              })),
            ]}
          />

          <Select
            value={featuredFilter}
            onChange={onFeaturedFilterChange}
            className="w-full sm:w-[180px]"
            options={FEATURE_FILTERS}
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

TrainingFilters.displayName = "TrainingFilters";

export default TrainingFilters;
