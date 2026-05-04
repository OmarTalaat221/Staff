import { memo, useCallback, useMemo } from "react";
import { Dropdown } from "antd";
import { MoreHorizontal, Eye, Pencil, Trash2, Coffee } from "lucide-react";
import dayjs from "dayjs";

const shiftColorMap = {
  morning: {
    bg: "bg-warning/8",
    border: "border-warning/20",
    dot: "bg-warning",
    breakBg: "bg-text/8",
    breakBorder: "border-text/10",
  },
  afternoon: {
    bg: "bg-primary/8",
    border: "border-primary/20",
    dot: "bg-primary",
    breakBg: "bg-text/8",
    breakBorder: "border-text/10",
  },
  evening: {
    bg: "bg-secondary/8",
    border: "border-secondary/20",
    dot: "bg-secondary",
    breakBg: "bg-text/8",
    breakBorder: "border-text/10",
  },
};

const ACTION_ITEMS = [
  {
    key: "view",
    label: "View Details",
    icon: <Eye size={15} />,
  },
  {
    key: "edit",
    label: "Edit Shift",
    icon: <Pencil size={15} />,
  },
  { type: "divider" },
  {
    key: "delete",
    label: "Remove",
    icon: <Trash2 size={15} />,
    danger: true,
  },
];

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

const formatMinutesToTime = (totalMinutes) => {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDisplayTime = (time) => {
  if (!time) return "";
  return dayjs(`2000-01-01 ${time}`).format("h:mm A");
};

const getBreakDisplayRange = (startTime, endTime, breakMinutes) => {
  if (!breakMinutes || breakMinutes <= 0) return null;

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = normalizeMinutes(endTime, startMinutes);
  const durationMinutes = endMinutes - startMinutes;

  if (durationMinutes <= breakMinutes) return null;

  const rawBreakStart = startMinutes + durationMinutes / 2 - breakMinutes / 2;
  const roundedBreakStart = Math.round(rawBreakStart / 30) * 30;
  const safeBreakStart = Math.min(
    Math.max(roundedBreakStart, startMinutes),
    endMinutes - breakMinutes
  );
  const safeBreakEnd = safeBreakStart + breakMinutes;

  const breakStart = formatMinutesToTime(safeBreakStart);
  const breakEnd = formatMinutesToTime(safeBreakEnd);

  return {
    start: breakStart,
    end: breakEnd,
    label: `${formatDisplayTime(breakStart)} - ${formatDisplayTime(breakEnd)}`,
  };
};

function ScheduleShiftCard({ shift, onView, onEdit, onDelete }) {
  const colors = shiftColorMap[shift.shiftType] || shiftColorMap.morning;

  const initials = useMemo(() => {
    return shift.staffName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [shift.staffName]);

  const shiftTimeLabel = useMemo(() => {
    return `${formatDisplayTime(shift.startTime)} - ${formatDisplayTime(
      shift.endTime
    )}`;
  }, [shift.startTime, shift.endTime]);

  const breakRange = useMemo(() => {
    return getBreakDisplayRange(
      shift.startTime,
      shift.endTime,
      shift.breakMinutes
    );
  }, [shift.startTime, shift.endTime, shift.breakMinutes]);

  const handleMenuClick = useCallback(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();

      if (key === "view") onView(shift);
      if (key === "edit") onEdit(shift);
      if (key === "delete") onDelete(shift);
    },
    [onView, onEdit, onDelete, shift]
  );

  return (
    <div
      className={`group relative p-2.5 rounded-xl border ${colors.bg} ${colors.border} transition-all hover:shadow-sm cursor-pointer`}
      onClick={() => onView(shift)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center text-text text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>

          <span className="text-xs font-semibold text-text truncate">
            {shift.staffName}
          </span>
        </div>

        <Dropdown
          menu={{
            items: ACTION_ITEMS,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-surface/80 text-text/40 hover:text-text transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
        </Dropdown>
      </div>

      <p className="text-[11px] text-text/50">{shift.staffRole}</p>

      <div className="flex items-center gap-1 mt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="text-[10px] text-text/45 font-medium">
          {shiftTimeLabel}
        </span>
      </div>

      {breakRange ? (
        <div
          className={`mt-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-text/60 ${colors.breakBg} ${colors.breakBorder}`}
        >
          <Coffee size={11} />
          Break {breakRange.label}
        </div>
      ) : null}
    </div>
  );
}

export default memo(ScheduleShiftCard);
