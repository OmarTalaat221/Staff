import { memo } from "react";
import { Card } from "antd";
import { Plus } from "lucide-react";
import ScheduleShiftCard from "./ScheduleShiftCard";

const shiftLabels = [
  { key: "all", label: "Shifts", time: "All Day" },
];

function ScheduleWeekView({
  weekDays,
  groupedShifts,
  onViewShift,
  onEditShift,
  onDeleteShift,
  onAddShift,
}) {
  return (
    <Card className="border-border! overflow-hidden">
      {/* Desktop view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr>
              <th className="w-[180px] p-3 text-left text-xs font-semibold text-text/50 border-b border-border">
                Day
              </th>
              <th className="p-3 text-left border-b border-border min-w-[230px]">
                <div>
                  <p className="text-xs font-semibold text-text">Shifts</p>
                  <p className="text-[10px] text-text/40 mt-0.5">All Day</p>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {weekDays.map((day) => (
              <tr key={day.date}>
                <td
                  className={`p-3 border-b border-border align-center${
                    day.isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-base font-medium ${
                        day.isToday ? "text-primary" : "text-text/50"
                      }`}
                    >
                      {day.dayName}
                    </span>

                    <span
                      className={`text-base font-bold leading-none ${
                        day.isToday ? "text-primary" : "text-text"
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    <span className="text-base text-text/40">
                      {day.monthName}
                    </span>

                    {day.isToday && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        TODAY
                      </span>
                    )}
                  </div>
                </td>

                <td
                  className={`p-2 border-b border-border border-l align-top ${
                    day.isToday ? "bg-primary/3" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1.5 min-h-[92px]">
                    <div className="flex flex-wrap gap-1.5">
                      {groupedShifts[day.date]?.map((shift) => (
                        <div key={shift.id} className="w-[230px]">
                          <ScheduleShiftCard
                            shift={shift}
                            onView={onViewShift}
                            onEdit={onEditShift}
                            onDelete={onDeleteShift}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onAddShift(day.date)}
                      className="w-full max-w-[230px] flex items-center justify-center gap-1 p-1.5 rounded-lg border border-dashed border-border/80 text-text/30 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-[11px]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet view */}
      <div className="lg:hidden space-y-4">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={`rounded-xl border border-border p-4 ${
              day.isToday ? "ring-2 ring-primary/20 border-primary/30" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`px-3 h-10 rounded-xl flex items-center gap-2 ${
                    day.isToday ? "bg-primary text-white" : "bg-bg text-text"
                  }`}
                >
                  <span className="text-xs font-medium leading-none">
                    {day.dayName}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {day.dayNumber}
                  </span>
                  <span className="text-xs leading-none">{day.monthName}</span>
                </div>

                {day.isToday && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    TODAY
                  </span>
                )}
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {groupedShifts[day.date]?.map((shift) => (
                  <ScheduleShiftCard
                    key={shift.id}
                    shift={shift}
                    onView={onViewShift}
                    onEdit={onEditShift}
                    onDelete={onDeleteShift}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onAddShift(day.date)}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-border text-text/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-medium mt-2"
            >
              <Plus size={14} />
              Add Shift
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default memo(ScheduleWeekView);
