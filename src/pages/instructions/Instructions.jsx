import React from "react";
import useInstructions from "./useInstructions";
import InstructionsHeader from "./components/InstructionsHeader";
import InstructionsStats from "./components/InstructionsStats";
import InstructionsFilters from "./components/InstructionsFilters";
import SOPCard from "./components/SOPCard";
import { FileText } from "lucide-react";

const Instructions = () => {
  const {
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    filteredSOPs,
    stats,
    hasActiveFilters,
    handleClearFilters,
    expandedIds,
    handleToggleExpand,
    handleExpandAll,
    handleCollapseAll,
    roles,
    categories,
    priorities,
  } = useInstructions();

  return (
    <div className="space-y-6">
      <InstructionsHeader
        total={stats.total}
        filteredCount={filteredSOPs.length}
        hasActiveFilters={hasActiveFilters}
        allExpanded={expandedIds.length === stats.total}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <InstructionsStats stats={stats} />

      <InstructionsFilters
        search={search}
        onSearchChange={setSearch}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        roles={roles}
        categories={categories}
        priorities={priorities}
      />

      {filteredSOPs.length > 0 ? (
        <div className="space-y-4">
          {filteredSOPs.map((sop) => (
            <SOPCard
              key={sop.id}
              sop={sop}
              expanded={expandedIds.includes(sop.id)}
              onToggle={handleToggleExpand}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-[18px] border border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg">
            <FileText size={28} className="text-text/30" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-text">
            No instructions found
          </h3>
          <p className="text-sm text-text/50">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </div>
  );
};

export default Instructions;
