import { memo } from "react";
import { Clock, LogIn, LogOut, Coffee } from "lucide-react";
import AttendanceStatusBadge from "../AttendanceStatusBadge";

const OverviewTab = memo(function OverviewTab({ todayRecord, overviewStats }) {
  return (
    <div className="space-y-5">
      {/* Today */}
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="text-text font-semibold text-sm mb-4">Today</h3>

        {todayRecord ? (
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-text/50 text-xs">Status</p>
                <AttendanceStatusBadge status={todayRecord.status} />
              </div>
            </div>

            {todayRecord.checkIn && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                  <LogIn size={16} className="text-success" />
                </div>
                <div>
                  <p className="text-text/50 text-xs">Check In</p>
                  <p className="text-text text-sm font-semibold">
                    {todayRecord.checkIn}
                  </p>
                </div>
              </div>
            )}

            {todayRecord.checkOut && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
                  <LogOut size={16} className="text-danger" />
                </div>
                <div>
                  <p className="text-text/50 text-xs">Check Out</p>
                  <p className="text-text text-sm font-semibold">
                    {todayRecord.checkOut}
                  </p>
                </div>
              </div>
            )}

            {todayRecord.shiftName && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Coffee size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-text/50 text-xs">Shift</p>
                  <p className="text-text text-sm font-semibold">
                    {todayRecord.shiftName} ({todayRecord.scheduledStart} –{" "}
                    {todayRecord.scheduledEnd})
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-text/50 text-sm">
            No attendance record for today.
          </p>
        )}
      </div>

      {/* Hours summary */}
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="text-text font-semibold text-sm mb-4">Hours Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today", value: overviewStats.todayHours },
            { label: "This Week", value: overviewStats.weekHours },
            { label: "This Month", value: overviewStats.monthHours },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg rounded-xl p-4">
              <p className="text-text/50 text-xs mb-1">{label}</p>
              <p className="text-text text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Month breakdown */}
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="text-text font-semibold text-sm mb-4">This Month</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-danger/5 border border-danger/10 rounded-xl p-4">
            <p className="text-text/50 text-xs mb-1">Absent Days</p>
            <p className="text-danger text-2xl font-bold">
              {overviewStats.absentDays}
            </p>
          </div>
          <div className="bg-warning/5 border border-warning/10 rounded-xl p-4">
            <p className="text-text/50 text-xs mb-1">On Leave Days</p>
            <p className="text-warning text-2xl font-bold">
              {overviewStats.onLeaveDays}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OverviewTab;
