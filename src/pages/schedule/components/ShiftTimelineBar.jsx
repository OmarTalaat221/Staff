import { memo, useMemo } from "react";
import dayjs from "dayjs";

const SHIFT_BAR_COLORS = {
  morning: "bg-warning",
  afternoon: "bg-primary",
  evening: "bg-secondary",
};

const parseTimeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const normalizeMinutes = (time, referenceMinutes) => {
  let minutes = parseTimeToMinutes(time);
  while (minutes < referenceMinutes) {
    minutes += 1440;
  }
  return minutes;
};

const formatDisplayTime = (time) => {
  if (!time) return "";
  return dayjs(`2000-01-01 ${time}`).format("h:mm A");
};

function ShiftTimelineBar({
  shiftType,
  startTime,
  endTime,
  breakStart,
  breakEnd,
}) {
  const workColor = SHIFT_BAR_COLORS[shiftType] || SHIFT_BAR_COLORS.morning;

  const timeline = useMemo(() => {
    const shiftStartMinutes = parseTimeToMinutes(startTime);
    const shiftEndMinutes = normalizeMinutes(endTime, shiftStartMinutes);
    const totalDuration = shiftEndMinutes - shiftStartMinutes;

    if (!breakStart || !breakEnd || totalDuration <= 0) {
      return {
        hasBreak: false,
        segments: [
          {
            key: "work-full",
            width: 100,
            className: workColor,
          },
        ],
      };
    }

    const breakStartMinutes = normalizeMinutes(breakStart, shiftStartMinutes);
    const breakEndMinutes = normalizeMinutes(breakEnd, breakStartMinutes);

    if (
      breakStartMinutes >= shiftEndMinutes ||
      breakEndMinutes <= shiftStartMinutes ||
      breakEndMinutes <= breakStartMinutes
    ) {
      return {
        hasBreak: false,
        segments: [
          {
            key: "work-full",
            width: 100,
            className: workColor,
          },
        ],
      };
    }

    const visibleBreakStart = Math.max(shiftStartMinutes, breakStartMinutes);
    const visibleBreakEnd = Math.min(shiftEndMinutes, breakEndMinutes);

    const beforeBreak =
      ((visibleBreakStart - shiftStartMinutes) / totalDuration) * 100;
    const breakWidth =
      ((visibleBreakEnd - visibleBreakStart) / totalDuration) * 100;
    const afterBreak = Math.max(0, 100 - beforeBreak - breakWidth);

    return {
      hasBreak: breakWidth > 0,
      segments: [
        beforeBreak > 0
          ? {
              key: "work-before",
              width: beforeBreak,
              className: workColor,
            }
          : null,
        breakWidth > 0
          ? {
              key: "break",
              width: breakWidth,
              className: "bg-text/20",
            }
          : null,
        afterBreak > 0
          ? {
              key: "work-after",
              width: afterBreak,
              className: workColor,
            }
          : null,
      ].filter(Boolean),
    };
  }, [startTime, endTime, breakStart, breakEnd, workColor]);

  return (
    <div>
      <div className="h-2.5 rounded-full bg-bg border border-border/70 overflow-hidden flex">
        {timeline.segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${segment.width}%` }}
          />
        ))}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-text/40">
        <span>{formatDisplayTime(startTime)}</span>
        <span>{formatDisplayTime(endTime)}</span>
      </div>

      {timeline.hasBreak ? (
        <div className="mt-1 inline-flex items-center rounded-md bg-text/6 px-1.5 py-0.5 text-[10px] font-medium text-text/60">
          Break {formatDisplayTime(breakStart)} - {formatDisplayTime(breakEnd)}
        </div>
      ) : (
        <div className="mt-1 text-[10px] text-text/35">No break</div>
      )}
    </div>
  );
}

export default memo(ShiftTimelineBar);
