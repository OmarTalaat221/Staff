import React from "react";
import { Button } from "antd";
import { BookOpen, ChevronsDown, ChevronsUp } from "lucide-react";

const InstructionsHeader = React.memo(
  ({
    total,
    filteredCount,
    hasActiveFilters,
    allExpanded,
    onExpandAll,
    onCollapseAll,
    onAddCategory,
    onAddSOP,
  }) => {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text sm:text-2xl">
              Instructions
            </h1>
            <p className="text-sm text-text/50">
              {hasActiveFilters
                ? `Showing ${filteredCount} of ${total} procedures`
                : `${total} standard operating procedures`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="dashed"
            onClick={onAddCategory}
            className="font-medium"
          >
            Add Category
          </Button>
          <Button
            type="primary"
            onClick={onAddSOP}
            className="font-medium"
          >
            Add SOP
          </Button>
          <Button
            icon={
              allExpanded ? (
                <ChevronsUp size={16} />
              ) : (
                <ChevronsDown size={16} />
              )
            }
            onClick={allExpanded ? onCollapseAll : onExpandAll}
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      </div>
    );
  }
);

InstructionsHeader.displayName = "InstructionsHeader";

export default InstructionsHeader;
