import React from "react";
import useAttendanceTab from "./useAttendanceTab";
import AttendanceStats from "./components/AttendanceStats";
import AttendanceFilters from "./components/AttendanceFilters";
import AttendanceTable from "./components/AttendanceTable";

const AttendanceTabContent = React.memo(function AttendanceTabContent() {
  const {
    period,
    selectedDate,
    searchRaw,
    department,
    role,
    statusFilter,
    hasActiveFilters,
    stats,
    pagedRecords,
    totalRecords,
    page,
    pageSize,
    departments,
    roles,
    handlePeriodChange,
    handleDateChange,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleStatusChange,
    handleClearFilters,
    handlePageChange,
    handleViewProfile,
  } = useAttendanceTab();

  return (
    <div className="space-y-5">
      <AttendanceStats stats={stats} />

      <AttendanceFilters
        period={period}
        selectedDate={selectedDate}
        searchRaw={searchRaw}
        department={department}
        role={role}
        statusFilter={statusFilter}
        hasActiveFilters={hasActiveFilters}
        departments={departments}
        roles={roles}
        onPeriodChange={handlePeriodChange}
        onDateChange={handleDateChange}
        onSearchChange={handleSearchChange}
        onDepartmentChange={handleDepartmentChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />

      <AttendanceTable
        records={pagedRecords}
        total={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
});

export default AttendanceTabContent;
