import { useState } from "react";
import { CalendarDays, ClipboardList } from "lucide-react";
import useSchedulePage from "./useSchedulePage";
import ScheduleStats from "./components/ScheduleStats";
import ScheduleFilters from "./components/ScheduleFilters";
import ScheduleWeekView from "./components/ScheduleWeekView";
import ShiftDrawer from "./components/ShiftDrawer";
import ShiftViewModal from "./components/ShiftViewModal";
import ShiftDeleteModal from "./components/ShiftDeleteModal";
import BreakTimeSettings from "./components/BreakTimeSettings";
import AttendanceTabContent from "./attendance/AttendanceTabContent";

const TABS = [
  { key: "schedule", label: "Schedule", icon: CalendarDays },
  { key: "attendance", label: "Attendance", icon: ClipboardList },
];

export default function Schedule() {
  const [activeTab, setActiveTab] = useState("schedule");

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

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-text/50 hover:text-text hover:border-border"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1 — Schedule */}
      {activeTab === "schedule" && (
        <>
          <ScheduleStats stats={stats} />

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

          <ScheduleWeekView
            weekDays={weekDays}
            groupedShifts={groupedShifts}
            onViewShift={handleViewShift}
            onEditShift={handleOpenEdit}
            onDeleteShift={handleOpenDelete}
            onAddShift={handleOpenAdd}
          />

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
          <ShiftViewModal
            open={viewModalOpen}
            onClose={handleCloseView}
            shift={viewShift}
          />
          <ShiftDeleteModal
            open={deleteModalOpen}
            onClose={handleCloseDelete}
            onConfirm={handleConfirmDelete}
            shift={deleteShift}
            loading={deleteLoading}
          />
          <BreakTimeSettings
            open={breakModalOpen}
            onClose={handleCloseBreakSettings}
            presets={breakPresets}
            onSave={handleSaveBreakPresets}
          />
        </>
      )}

      {/* Tab 2 — Attendance */}
      {activeTab === "attendance" && <AttendanceTabContent />}
    </div>
  );
}
