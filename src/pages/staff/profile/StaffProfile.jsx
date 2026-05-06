import { memo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Tabs } from "antd";
import {
  User,
  Clock,
  CalendarDays,
  TreePalm,
  Banknote,
  Calculator,
} from "lucide-react";
import useStaffProfile from "./useStaffProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import OverviewTab from "./components/tabs/OverviewTab";
import AttendanceTab from "./components/tabs/AttendanceTab";
import ScheduleTab from "./components/tabs/ScheduleTab";
import LeavesTab from "./components/tabs/LeavesTab";
import TransfersTab from "./components/tabs/TransfersTab";
import SettlementTab from "./components/tabs/SettlementTab";

const TAB_DEFS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "schedule", label: "Schedule", icon: CalendarDays },
  { key: "leaves", label: "Leaves", icon: TreePalm },
  { key: "transfers", label: "Transfers", icon: Banknote },
  { key: "settlement", label: "Settlement", icon: Calculator },
];

const StaffProfile = memo(function StaffProfile() {
  const { id } = useParams();
  const {
    staff,
    activeTab,
    handleTabChange,
    attendancePeriod,
    attendanceDate,
    handleAttendancePeriodChange,
    handleAttendanceDateChange,
    filteredAttendance,
    attendanceSummary,
    todayRecord,
    overviewStats,
    leaves,
    transfers,
    schedules,
    settlementMonth,
    handleSettlementMonthChange,
    settlement,
  } = useStaffProfile(id);

  if (!staff) return <Navigate to="/staff" replace />;

  const tabItems = TAB_DEFS.map(({ key, label, icon: Icon }) => ({
    key,
    label: (
      <span className="flex items-center gap-2">
        <Icon size={15} />
        {label}
      </span>
    ),
  }));

  return (
    <div className="space-y-5">
      <ProfileHeader staff={staff} />
      <ProfileStats overviewStats={overviewStats} />

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />

        <div className="mt-4">
          {activeTab === "overview" && (
            <OverviewTab
              todayRecord={todayRecord}
              overviewStats={overviewStats}
            />
          )}
          {activeTab === "attendance" && (
            <AttendanceTab
              filteredAttendance={filteredAttendance}
              attendanceSummary={attendanceSummary}
              attendancePeriod={attendancePeriod}
              attendanceDate={attendanceDate}
              onPeriodChange={handleAttendancePeriodChange}
              onDateChange={handleAttendanceDateChange}
            />
          )}
          {activeTab === "schedule" && <ScheduleTab schedules={schedules} />}
          {activeTab === "leaves" && <LeavesTab leaves={leaves} />}
          {activeTab === "transfers" && <TransfersTab transfers={transfers} />}
          {activeTab === "settlement" && (
            <SettlementTab
              settlement={settlement}
              settlementMonth={settlementMonth}
              onMonthChange={handleSettlementMonthChange}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default StaffProfile;
