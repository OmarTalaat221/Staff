import React, { memo } from "react";
import { Plus } from "lucide-react";
import AttendanceShiftCard from "./AttendanceShiftCard";

function AttendanceWeekView({
  weekDays,
  groupedRecords,
  onEditRecord,
  onDeleteRecord,
  onAddLog,
  loading,
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Desktop view */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="bg-bg/40">
              <th className="w-[180px] p-4 text-left text-xs font-bold text-text/50 border-b border-border uppercase tracking-wider">
                Day
              </th>
              <th className="p-4 text-left border-b border-border min-w-[240px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text uppercase tracking-wider">
                      Staff Shifts & Attendance Logs
                    </p>
                    <p className="text-[10px] text-text/40 mt-0.5 font-medium">
                      All scheduled shifts, check-ins, and attendance status
                    </p>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {weekDays.map((day) => {
              const dayRecords = groupedRecords[day.date] || [];

              return (
                <tr
                  key={day.date}
                  className={`hover:bg-bg/25 transition-colors ${
                    day.isToday ? "bg-primary/2" : ""
                  }`}
                >
                  {/* Left Column: Day Header */}
                  <td
                    className={`p-4 border-b border-border align-top ${
                      day.isToday
                        ? "bg-primary/6 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-bold ${
                          day.isToday ? "text-primary" : "text-text/70"
                        }`}
                      >
                        {day.dayName}
                      </span>

                      <span
                        className={`text-base font-black ${
                          day.isToday ? "text-primary font-black" : "text-text"
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      <span className="text-sm font-semibold text-text/40">
                        {day.monthName}
                      </span>

                      {day.isToday && (
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          TODAY
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-text/40 mt-1 font-semibold">
                      {dayRecords.length}{" "}
                      {dayRecords.length === 1 ? "staff" : "staff members"}
                    </div>
                  </td>

                  {/* Right Column: Shift / Attendance Cards */}
                  <td
                    className={`p-3 border-b border-border border-l border-border align-top ${
                      day.isToday ? "bg-primary/1" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2 min-h-[96px]">
                      <div className="flex flex-wrap gap-2.5">
                        {dayRecords.map((record) => (
                          <div
                            key={record.id || `${record.staffId}-${record.date}`}
                            className="w-[270px]"
                          >
                            <AttendanceShiftCard
                              record={record}
                              onEdit={onEditRecord}
                              onDelete={onDeleteRecord}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onAddLog(day.date)}
                        className="w-full max-w-[270px] flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-border text-text/40 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Log for {day.dayName}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(AttendanceWeekView);
