import { memo } from "react";
import { CalendarDays } from "lucide-react";
import dayjs from "dayjs";

const PERIOD_COLORS = {
  Morning: "bg-warning/10 text-warning border-warning/20",
  Afternoon: "bg-primary/10 text-primary border-primary/20",
  Evening: "bg-secondary/10 text-secondary border-secondary/20",
};

const ScheduleTab = memo(function ScheduleTab({ schedules }) {
  if (!schedules.length) {
    return (
      <div className="bg-surface border border-border rounded-[18px] p-10 text-center">
        <CalendarDays size={36} className="text-text/20 mx-auto mb-3" />
        <p className="text-text/50 text-sm">No scheduled shifts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-text font-semibold text-sm">Scheduled Shifts</h3>
        <p className="text-text/50 text-xs mt-0.5">
          {schedules.length} shifts found
        </p>
      </div>

      <div className="divide-y divide-border">
        {schedules.map((shift) => {
          const colorClass =
            PERIOD_COLORS[shift.period] || "bg-bg text-text border-border";
          return (
            <div key={shift.id} className="flex items-center gap-4 px-5 py-4">
              <div className="text-center w-14 shrink-0">
                <p className="text-text/50 text-xs">
                  {dayjs(shift.date).format("ddd")}
                </p>
                <p className="text-text font-bold text-lg leading-tight">
                  {dayjs(shift.date).format("DD")}
                </p>
                <p className="text-text/50 text-xs">
                  {dayjs(shift.date).format("MMM")}
                </p>
              </div>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
              >
                {shift.period}
              </div>

              <div className="flex-1">
                <p className="text-text text-sm font-medium">
                  {shift.startTime} – {shift.endTime}
                </p>
                <p className="text-text/50 text-xs mt-0.5">
                  Break: {shift.breakMinutes}min
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ScheduleTab;
