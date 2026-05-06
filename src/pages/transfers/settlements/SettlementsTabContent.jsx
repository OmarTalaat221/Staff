import React from "react";
import useSettlementsTab from "./useSettlementsTab";
import SettlementsStats from "./components/SettlementsStats";
import SettlementsFilters from "./components/SettlementsFilters";
import SettlementsTable from "./components/SettlementsTable";
import SettlementsViewModal from "./components/SettlementsViewModal";

const SettlementsTabContent = React.memo(function SettlementsTabContent() {
  const {
    selectedMonth,
    searchRaw,
    department,
    role,
    hasActiveFilters,
    stats,
    filteredSettlements,
    departments,
    roles,
    viewModalOpen,
    viewStaff,
    handleMonthChange,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleClearFilters,
    handleViewBreakdown,
    handleCloseModal,
  } = useSettlementsTab();

  return (
    <div className="space-y-5">
      <SettlementsStats stats={stats} />

      <SettlementsFilters
        selectedMonth={selectedMonth}
        searchRaw={searchRaw}
        department={department}
        role={role}
        hasActiveFilters={hasActiveFilters}
        departments={departments}
        roles={roles}
        onMonthChange={handleMonthChange}
        onSearchChange={handleSearchChange}
        onDepartmentChange={handleDepartmentChange}
        onRoleChange={handleRoleChange}
        onClearFilters={handleClearFilters}
      />

      <SettlementsTable
        settlements={filteredSettlements}
        onViewBreakdown={handleViewBreakdown}
      />

      <SettlementsViewModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        staff={viewStaff}
      />
    </div>
  );
});

export default SettlementsTabContent;
