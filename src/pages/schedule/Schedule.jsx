import useSchedulePage from "./useSchedulePage";
import ScheduleStats from "./components/ScheduleStats";
import ScheduleFilters from "./components/ScheduleFilters";
import ScheduleWeekView from "./components/ScheduleWeekView";
import ShiftDrawer from "./components/ShiftDrawer";
import ShiftViewModal from "./components/ShiftViewModal";
import ShiftDeleteModal from "./components/ShiftDeleteModal";
import BreakTimeSettings from "./components/BreakTimeSettings";

export default function Schedule() {
  const {
    weekDays,
    weekLabel,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    groupedShifts,
    stats,
    shiftTypes,
    staffMembers,
    shiftTypeFilter,
    setShiftTypeFilter,
    roleFilter,
    setRoleFilter,
    hasActiveFilters,
    handleClearFilters,
    drawerOpen,
    editShift,
    drawerLoading,
    preSelectedDate,
    preSelectedShiftType,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitShift,
    viewModalOpen,
    viewShift,
    handleViewShift,
    handleCloseView,
    deleteModalOpen,
    deleteShift,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
    breakModalOpen,
    breakPresets,
    handleOpenBreakSettings,
    handleCloseBreakSettings,
    handleSaveBreakPresets,
  } = useSchedulePage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Schedule</h1>
        <p className="text-sm text-text/60 mt-0.5">
          Manage shifts, working hours, and break times
        </p>
      </div>

      {/* Stats */}
      <ScheduleStats stats={stats} />

      {/* Filters + Navigation */}
      <ScheduleFilters
        weekLabel={weekLabel}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onToday={goToToday}
        shiftTypeFilter={shiftTypeFilter}
        onShiftTypeChange={setShiftTypeFilter}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onAddShift={handleOpenAdd}
        onOpenBreakSettings={handleOpenBreakSettings}
      />

      {/* Week Grid */}
      <ScheduleWeekView
        weekDays={weekDays}
        groupedShifts={groupedShifts}
        onViewShift={handleViewShift}
        onEditShift={handleOpenEdit}
        onDeleteShift={handleOpenDelete}
        onAddShift={handleOpenAdd}
      />

      {/* Shift Drawer */}
      <ShiftDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmitShift}
        editShift={editShift}
        loading={drawerLoading}
        weekDays={weekDays}
        shiftTypes={shiftTypes}
        staffMembers={staffMembers}
        preSelectedDate={preSelectedDate}
        preSelectedShiftType={preSelectedShiftType}
      />

      {/* View Modal */}
      <ShiftViewModal
        open={viewModalOpen}
        onClose={handleCloseView}
        shift={viewShift}
      />

      {/* Delete Modal */}
      <ShiftDeleteModal
        open={deleteModalOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        shift={deleteShift}
        loading={deleteLoading}
      />

      {/* Break Time Settings */}
      <BreakTimeSettings
        open={breakModalOpen}
        onClose={handleCloseBreakSettings}
        presets={breakPresets}
        onSave={handleSaveBreakPresets}
      />
    </div>
  );
}
