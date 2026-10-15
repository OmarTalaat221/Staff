import React, { memo, useMemo, useCallback } from "react";
import { Dropdown } from "antd";
import { MoreHorizontal, Eye, Pencil, Trash2, Clock, CheckCircle2, AlertCircle, XCircle, Coffee } from "lucide-react";
import dayjs from "dayjs";

const shiftTypeColors = {
  morning: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  afternoon: {
    dot: "bg-primary",
    text: "text-primary",
    bg: "bg-primary/10",
  },
  evening: {
    dot: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
};

const statusConfig = {
  present: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/6 hover:bg-emerald-500/10",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    label: "Present",
    icon: CheckCircle2,
  },
  late: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/6 hover:bg-amber-500/10",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
    label: "Late",
    icon: AlertCircle,
  },
  absent: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/6 hover:bg-rose-500/10",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
    label: "Absent",
    icon: XCircle,
  },
  "on-leave": {
    border: "border-blue-500/30",
    bg: "bg-blue-500/6 hover:bg-blue-500/10",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "On Leave",
    icon: Clock,
  },
  scheduled: {
    border: "border-border",
    bg: "bg-surface hover:bg-bg/40",
    badge: "bg-text/5 text-text/60 border-border",
    label: "Scheduled",
    icon: Clock,
  },
};

const formatTime12 = (timeStr) => {
  if (!timeStr) return "";
  const cleaned = timeStr.trim();
  if (cleaned.includes(" ")) {
    const timePart = cleaned.split(" ")[1];
    return dayjs(`2000-01-01 ${timePart}`).format("h:mm A");
  }
  return dayjs(`2000-01-01 ${cleaned}`).format("h:mm A");
};

function AttendanceShiftCard({ record, onEdit, onDelete, onView }) {
  const staffName = record.staffName || record.full_name || "Staff Member";
  const staffRole = record.staffRole || record.role || "Staff";
  const shiftType = (record.shiftName || record.shiftType || record.shift_type || "Morning").toLowerCase();
  const typeConfig = shiftTypeColors[shiftType] || shiftTypeColors.morning;

  const currentStatus = (record.status || (record.attendanceId || record.attendance_id ? "present" : (dayjs(record.date || record.shift_date).isAfter(dayjs(), "day") ? "scheduled" : "absent"))).toLowerCase();
  const statusInfo = statusConfig[currentStatus] || statusConfig.scheduled;
  const StatusIcon = statusInfo.icon;

  const initials = useMemo(() => {
    return staffName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [staffName]);

  const scheduledTime = useMemo(() => {
    const start = record.scheduledStart || record.start_time;
    const end = record.scheduledEnd || record.end_time;
    if (!start) return "";
    return `${formatTime12(start)} - ${formatTime12(end)}`;
  }, [record.scheduledStart, record.start_time, record.scheduledEnd, record.end_time]);

  const checkInDisplay = useMemo(() => {
    if (record.checkIn) return record.checkIn;
    if (record.check_in_time) return formatTime12(record.check_in_time);
    return null;
  }, [record.checkIn, record.check_in_time]);

  const checkOutDisplay = useMemo(() => {
    if (record.checkOut) return record.checkOut;
    if (record.check_out_time) return formatTime12(record.check_out_time);
    return null;
  }, [record.checkOut, record.check_out_time]);

  const actionItems = useMemo(() => [
    {
      key: "edit",
      label: "Edit Log",
      icon: <Pencil size={14} />,
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Delete Log",
      icon: <Trash2 size={14} />,
      danger: true,
    },
  ], []);

  const handleMenuClick = useCallback(({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "edit" && onEdit) onEdit(record);
    if (key === "delete" && onDelete) onDelete(record);
  }, [record, onEdit, onDelete]);

  return (
    <div
      onClick={() => onEdit && onEdit(record)}
      className={`group relative p-3 rounded-2xl border ${statusInfo.bg} ${statusInfo.border} transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col gap-2`}
    >
      {/* Top Header: Avatar + Staff Info + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm"
            style={{ backgroundColor: "#84B067" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-text truncate leading-tight">
              {staffName}
            </p>
            <p className="text-[10px] text-text/50 truncate font-semibold">
              {staffRole} {record.department ? `· ${record.department}` : ""}
            </p>
          </div>
        </div>

        <Dropdown
          menu={{ items: actionItems, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-surface text-text/40 hover:text-text transition-all cursor-pointer"
          >
            <MoreHorizontal size={15} />
          </button>
        </Dropdown>
      </div>

      {/* Shift Badge & Scheduled Time */}
      <div className="flex items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${typeConfig.dot} shrink-0`} />
          <span className="font-semibold text-text/70 truncate capitalize">
            {shiftType} Shift
          </span>
        </div>
        {scheduledTime && (
          <span className="text-[10px] text-text/45 font-medium shrink-0">
            {scheduledTime}
          </span>
        )}
      </div>

      {/* Attendance Punch In / Punch Out Info */}
      <div className="bg-surface/80 rounded-xl p-2 border border-border/60 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {checkInDisplay ? (
            <div className="text-[11px] font-bold text-text flex items-center gap-1">
              <span className="text-success font-black">In:</span> {checkInDisplay}
              {checkOutDisplay && (
                <>
                  <span className="text-text/30 mx-0.5">·</span>
                  <span className="text-primary font-black">Out:</span> {checkOutDisplay}
                </>
              )}
            </div>
          ) : (
            <div className="text-[10px] font-medium text-text/40">
              No clock recorded
            </div>
          )}
        </div>

        {/* Status Pill */}
        <span
          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1 shrink-0 ${statusInfo.badge}`}
        >
          <StatusIcon size={10} />
          {statusInfo.label}
          {record.lateMinutes > 0 && ` (+${record.lateMinutes}m)`}
        </span>
      </div>
    </div>
  );
}

export default memo(AttendanceShiftCard);
