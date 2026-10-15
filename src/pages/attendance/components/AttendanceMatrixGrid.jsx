import React, { useMemo } from "react";
import { Table, Tooltip, Popconfirm, Button } from "antd";
import { Plus, Edit2, Trash2, Calendar, PoundSterling, ListChecks } from "lucide-react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const EXPECTED_MONTHLY_HOURS = 176;

const getHourlyRate = (salaryAmount, salaryType) => {
  const amount = Number(salaryAmount) || 0;
  const type = String(salaryType || "").toLowerCase();
  if (type === "monthly") {
    return amount / EXPECTED_MONTHLY_HOURS;
  }
  return amount;
};

// Distinct, vibrant status badge configuration
export const getAttendanceStatusConfig = (status, isFuture) => {
  if (isFuture) {
    return {
      label: "SCHEDULED",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      cardBorder: "border-slate-200/90 bg-slate-50/60 dark:bg-slate-900/30",
    };
  }
  switch (status) {
    case "present":
      return {
        label: "PRESENT",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700",
        cardBorder: "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/25",
      };
    case "late":
      return {
        label: "LATE",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700",
        cardBorder: "border-amber-300 bg-amber-50/40 dark:bg-amber-950/25",
      };
    case "absent":
      return {
        label: "ABSENT",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700",
        cardBorder: "border-rose-200 bg-rose-50/35 dark:bg-rose-950/20",
      };
    case "on-duty":
      return {
        label: "ON DUTY",
        badgeClass: "bg-emerald-200 text-emerald-900 border-emerald-400 animate-pulse",
        cardBorder: "border-emerald-400 bg-emerald-50/60",
      };
    case "on-leave":
      return {
        label: "ON LEAVE",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
        cardBorder: "border-blue-200 bg-blue-50/35",
      };
    default:
      return {
        label: (status || "SCHEDULED").toUpperCase(),
        badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
        cardBorder: "border-gray-200 bg-gray-50/40",
      };
  }
};

// Helper to determine exact cell attendance, punches, and worked hours
const getCellAttendanceData = (shift, attRecord, dateStr) => {
  const isFuture = dayjs(dateStr).isAfter(dayjs(), "day");

  let status = "scheduled";
  let workedHours = 0;
  let workedMinutes = 0;
  let checkIn = null;
  let checkOut = null;
  let isClockedIn = false;

  if (attRecord && attRecord.attendanceId) {
    checkIn = attRecord.checkIn;
    checkOut = attRecord.checkOut;
    workedMinutes = attRecord.workedMinutes || 0;
    workedHours = workedMinutes / 60;
    if (checkIn && !checkOut) {
      status = "on-duty";
      isClockedIn = true;
    } else if (attRecord.lateMinutes > 0) {
      status = "late";
      isClockedIn = true;
    } else {
      status = "present";
      isClockedIn = true;
    }
  } else if (shift) {
    if (isFuture) {
      status = "scheduled";
      workedHours = 0;
    } else {
      status = "absent";
      workedHours = 0;
    }
  }

  return {
    status,
    workedHours,
    workedMinutes,
    checkIn,
    checkOut,
    isClockedIn,
    isFuture,
  };
};

export default function AttendanceMatrixGrid({
  staffList = [],
  shifts = [],
  records = [],
  selectedMonth = dayjs(),
  showCost = false,
  onOpenAdd,
  onOpenEdit,
  onDeleteShift,
  onOpenTasks,
  onQuickAddStaff,
  loading = false,
}) {
  const rotaYear = selectedMonth.year();
  const rotaMonth = selectedMonth.month() + 1;
  const daysInMonth = selectedMonth.daysInMonth();

  const allDayNumbers = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Map shifts by "employeeId_dayNumber" for rapid lookup
  const shiftsMap = useMemo(() => {
    const map = {};
    shifts.forEach((shift) => {
      const shiftDate = shift.shift_date;
      if (!shiftDate) return;
      const d = dayjs(shiftDate);
      if (d.year() === rotaYear && d.month() + 1 === rotaMonth) {
        const dayNum = d.date();
        const key = `${shift.employee_id}_${dayNum}`;
        if (!map[key]) map[key] = [];
        map[key].push(shift);
      }
    });
    return map;
  }, [shifts, rotaYear, rotaMonth]);

  // Map attendance logs by "staffId_date" for punch lookup
  const attendanceMap = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.date) return;
      const key = `${r.staffId}_${r.date}`;
      map[key] = r;
    });
    return map;
  }, [records]);

  // Compute ACTUAL worked hours & costs across all employees and days
  const { dailyHours, dailyCosts, grandTotalHours, grandTotalCost } = useMemo(() => {
    const hours = {};
    const costs = {};
    let totalH = 0;
    let totalC = 0;

    allDayNumbers.forEach((day) => {
      const dateStr = dayjs(
        `${rotaYear}-${String(rotaMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      ).format("YYYY-MM-DD");

      let dHours = 0;
      let dCosts = 0;

      staffList.forEach((staff) => {
        const empShifts = shiftsMap[`${staff.id}_${day}`] || [];
        const attRecord = attendanceMap[`${staff.id}_${dateStr}`];
        const rawSalary = parseFloat(staff.salary ?? 0);
        const salaryType = staff.salary_type ?? "hourly";
        const hourlyRate = getHourlyRate(rawSalary, salaryType);

        if (empShifts.length > 0) {
          empShifts.forEach((s) => {
            const data = getCellAttendanceData(s, attRecord, dateStr);
            dHours += data.workedHours;
            if (hourlyRate > 0) {
              dCosts += hourlyRate * data.workedHours;
            }
          });
        } else if (attRecord && attRecord.attendanceId) {
          const data = getCellAttendanceData(null, attRecord, dateStr);
          dHours += data.workedHours;
          if (hourlyRate > 0) {
            dCosts += hourlyRate * data.workedHours;
          }
        }
      });

      hours[day] = dHours;
      costs[day] = dCosts;
      totalH += dHours;
      totalC += dCosts;
    });

    return {
      dailyHours: hours,
      dailyCosts: costs,
      grandTotalHours: totalH,
      grandTotalCost: totalC,
    };
  }, [allDayNumbers, staffList, shiftsMap, attendanceMap, rotaYear, rotaMonth]);

  // Columns definition
  const columns = useMemo(() => {
    const cols = [
      {
        title: "EMPLOYEE",
        key: "employee",
        width: 150,
        fixed: "left",
        render: (_, record) => {
          const firstLetter = (record.name || "S").charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                {firstLetter}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold truncate leading-none text-text">
                    {record.name}
                  </div>
                  <Tooltip title="View monthly shifts">
                    <button
                      onClick={() => onOpenAdd?.(1, record.id)}
                      className="text-primary/60 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Calendar size={11} />
                    </button>
                  </Tooltip>
                </div>
                <div className="text-[9px] text-text/40 truncate uppercase mt-0.5">
                  {record.role || "Staff"}
                </div>
              </div>
            </div>
          );
        },
      },
    ];

    allDayNumbers.forEach((day) => {
      const dateObj = dayjs(`${rotaYear}-${String(rotaMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      const dayName = dateObj.format("ddd");
      const isWeekend = dateObj.day() === 5 || dateObj.day() === 6; // Fri & Sat
      const weekendCellStyle = isWeekend ? { backgroundColor: "rgba(34,197,94,0.06)" } : {};
      const dateStr = dateObj.format("YYYY-MM-DD");

      cols.push({
        title: (
          <div className="text-center">
            <div className={`text-[9px] font-bold uppercase leading-none ${isWeekend ? "text-emerald-500" : "text-text/40"}`}>
              {dayName}
            </div>
            <div className={`text-[11px] font-black leading-tight mt-0.5 ${isWeekend ? "text-emerald-500" : "text-primary"}`}>
              {day}-{rotaMonth}-{rotaYear}
            </div>
          </div>
        ),
        key: `day_${day}`,
        width: 118,
        align: "center",
        onHeaderCell: () => ({ style: weekendCellStyle }),
        onCell: () => ({ style: weekendCellStyle }),
        render: (_, record) => {
          const empShifts = shiftsMap[`${record.id}_${day}`] || [];
          const attRecord = attendanceMap[`${record.id}_${dateStr}`];

          // Determine items to display: scheduled shifts or unassigned attendance log
          const itemsToRender = empShifts.length > 0 ? empShifts : attRecord && attRecord.attendanceId ? [{ isLogOnly: true }] : [];

          return (
            <div className="group relative min-h-[64px] flex flex-col gap-1 justify-center py-1">
              {itemsToRender.map((shift, idx) => {
                const cellData = getCellAttendanceData(shift.isLogOnly ? null : shift, attRecord, dateStr);
                const statusCfg = getAttendanceStatusConfig(cellData.status, cellData.isFuture);
                const shiftLetter = ((shift.shift_type || attRecord?.shiftName || "M")).charAt(0).toUpperCase();
                const startTimeStr = (shift.start_time || attRecord?.scheduledStart || "").slice(0, 5);
                const endTimeStr = (shift.end_time || attRecord?.scheduledEnd || "").slice(0, 5);
                const tasks = attRecord?.dailyTasks || [];
                const doneCount = tasks.filter((t) => t.done).length;
                const openTasks = () =>
                  onOpenTasks?.(
                    attRecord || {
                      id: shift.shift_id,
                      staffId: record.id,
                      staffName: record.name,
                      date: dateStr,
                      shiftName: shift.shift_type,
                      lateMinutes: 0,
                      status: cellData.status,
                      dailyTasks: [],
                    }
                  );

                return (
                  <div
                    key={shift.shift_id || idx}
                    className={`p-1.5 rounded-lg border text-left relative group/item transition-all ${statusCfg.cardBorder}`}
                  >
                    {/* Header: Shift Letter + Distinct Status Badge + Hover Actions */}
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[8px] font-black text-text/60 uppercase">
                          {shiftLetter}
                        </span>
                        <span
                          className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded leading-none border tracking-wider ${statusCfg.badgeClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {!cellData.isFuture && (
                          <button
                            onClick={openTasks}
                            className="text-emerald-600 hover:text-emerald-500 cursor-pointer"
                            title="Daily Tasks"
                          >
                            <ListChecks size={9} />
                          </button>
                        )}
                      {!shift.isLogOnly && (
                        <>
                          <button
                            onClick={() => onOpenEdit?.({ ...shift, day_number: day, employee_id: record.id })}
                            className="text-primary hover:text-primary/70 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={8} />
                          </button>
                          <Popconfirm
                            title="Delete shift?"
                            okText="Delete"
                            cancelText="Cancel"
                            onConfirm={() => onDeleteShift?.(shift)}
                          >
                            <button className="text-red-500 hover:text-red-600 cursor-pointer" title="Delete">
                              <Trash2 size={8} />
                            </button>
                          </Popconfirm>
                        </>
                      )}
                      </div>
                    </div>

                    {tasks.length > 0 && (
                      <button
                        onClick={openTasks}
                        className={`absolute bottom-1 right-1 flex items-center gap-0.5 text-[7.5px] font-black px-1 py-0.5 rounded leading-none border cursor-pointer ${
                          doneCount === tasks.length
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                        title={tasks
                          .map((t) => `${t.done ? "✓" : "○"} ${t.title}${t.done && t.doneAt ? ` (${dayjs(t.doneAt).format("h:mm a")})` : ""}`)
                          .join(" | ")}
                      >
                        <ListChecks size={8} />
                        {doneCount}/{tasks.length}
                      </button>
                    )}

                    {/* Middle: Attendance In/Out or Scheduled Time */}
                    {cellData.status === "present" || cellData.status === "late" || cellData.status === "on-duty" ? (
                      <div className="space-y-0.5">
                        <div className="text-[8.5px] font-bold flex items-center gap-1 leading-tight flex-wrap">
                          <span className="text-emerald-600 font-extrabold">In: {cellData.checkIn}</span>
                          {cellData.checkOut && (
                            <span className="text-rose-600 font-extrabold">Out: {cellData.checkOut}</span>
                          )}
                        </div>
                        {cellData.workedMinutes > 0 && (
                          <div className="text-[9px] font-black text-text leading-tight">
                            {Math.floor(cellData.workedMinutes / 60)}h {cellData.workedMinutes % 60}m
                          </div>
                        )}
                        {startTimeStr && (
                          <div className="text-[7px] text-text/40 leading-none">
                            Sched: {startTimeStr}-{endTimeStr}
                          </div>
                        )}
                      </div>
                    ) : cellData.status === "absent" ? (
                      <div className="space-y-0.5">
                        <div className="text-[8px] text-text/40 font-semibold leading-tight">
                          In: — · Out: —
                        </div>
                        {startTimeStr && (
                          <div className="text-[7px] text-rose-500/80 font-semibold line-through leading-none">
                            Sched: {startTimeStr}-{endTimeStr}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Scheduled Future Shift */
                      <div className="space-y-0.5">
                        <div className="text-[9px] text-text font-bold leading-tight">
                          {startTimeStr}-{endTimeStr}
                        </div>
                        {shift.break_start && (
                          <div className="text-[7px] text-text/40 leading-none">
                            B: {shift.break_start.slice(0, 5)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => onOpenAdd?.(day, record.id)}
                className="opacity-0 group-hover:opacity-100 absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10 cursor-pointer"
                title="Add Shift"
              >
                <Plus size={10} strokeWidth={3} />
              </button>

              {itemsToRender.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-text/15 text-xs select-none">
                  —
                </div>
              )}
            </div>
          );
        },
      });
    });

    // Right fixed column: Total Worked Hours & Total Cost
    cols.push({
      title: (
        <div className="text-center">
          <div className="text-[9px] text-primary uppercase font-bold">TOTAL</div>
          <div className="text-[11px] font-black text-primary">HOURS / COST</div>
        </div>
      ),
      key: "employee_total",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        let empHours = 0;
        let empCost = 0;

        const rawSalary = parseFloat(record.salary ?? 0);
        const salaryType = record.salary_type ?? "hourly";
        const hourlyRate = getHourlyRate(rawSalary, salaryType);

        allDayNumbers.forEach((day) => {
          const dateStr = dayjs(
            `${rotaYear}-${String(rotaMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          ).format("YYYY-MM-DD");

          const empShifts = shiftsMap[`${record.id}_${day}`] || [];
          const attRecord = attendanceMap[`${record.id}_${dateStr}`];

          if (empShifts.length > 0) {
            empShifts.forEach((s) => {
              const data = getCellAttendanceData(s, attRecord, dateStr);
              empHours += data.workedHours;
              if (hourlyRate > 0) {
                empCost += hourlyRate * data.workedHours;
              }
            });
          } else if (attRecord && attRecord.attendanceId) {
            const data = getCellAttendanceData(null, attRecord, dateStr);
            empHours += data.workedHours;
            if (hourlyRate > 0) {
              empCost += hourlyRate * data.workedHours;
            }
          }
        });

        return (
          <div className="flex flex-col items-center gap-0.5">
            {empHours > 0 ? (
              <div className="text-[9px] font-black text-text leading-none">
                {empHours % 1 === 0 ? empHours : empHours.toFixed(1)}h
              </div>
            ) : (
              <div className="text-[8px] font-bold text-text/30 leading-none">0h</div>
            )}
            {showCost && (
              <div className="text-[11px] font-black text-primary">
                {empCost > 0
                  ? empCost.toLocaleString("en-US", { maximumFractionDigits: 0 })
                  : "0"}
              </div>
            )}
          </div>
        );
      },
    });

    return cols;
  }, [allDayNumbers, rotaYear, rotaMonth, shiftsMap, attendanceMap, showCost, onOpenAdd, onOpenEdit, onDeleteShift, onOpenTasks]);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <Table
        columns={columns}
        dataSource={staffList}
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
        size="small"
        bordered
        loading={loading}
        className="rota-details-compact-table"
        summary={() => (
          <Table.Summary fixed="bottom">
            <Table.Summary.Row className="bg-primary/5 font-bold">
              <Table.Summary.Cell index={0} fixed="left">
                <div className="text-[10px] text-primary flex items-center gap-1 font-bold">
                  <PoundSterling size={12} />
                  <span>Total Worked</span>
                </div>
              </Table.Summary.Cell>

              {allDayNumbers.map((day, index) => (
                <Table.Summary.Cell key={day} index={index + 1} align="center">
                  <div className="flex flex-col items-center gap-0.5">
                    {dailyHours[day] > 0 ? (
                      <div className="text-[8.5px] font-black text-text leading-none">
                        {dailyHours[day] % 1 === 0 ? dailyHours[day] : dailyHours[day].toFixed(1)}h
                      </div>
                    ) : (
                      <span className="text-text/20 text-[9px]">—</span>
                    )}
                    {showCost && (
                      <div className="text-primary text-[10px] font-bold">
                        {dailyCosts[day] > 0
                          ? dailyCosts[day].toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : "—"}
                      </div>
                    )}
                  </div>
                </Table.Summary.Cell>
              ))}

              <Table.Summary.Cell index={allDayNumbers.length + 1} align="center" className="bg-primary/10">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="text-[9px] font-black text-text leading-none">
                    {grandTotalHours > 0
                      ? (grandTotalHours % 1 === 0 ? grandTotalHours : grandTotalHours.toFixed(1)) + "h"
                      : "0h"}
                  </div>
                  {showCost && (
                    <div className="text-primary text-[11px] font-black">
                      {grandTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  )}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>

            {onQuickAddStaff && (
              <Table.Summary.Row className="bg-white">
                <Table.Summary.Cell index={0} fixed="left">
                  <Button
                    type="dashed"
                    icon={<Plus size={12} />}
                    onClick={onQuickAddStaff}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-bold border-primary/30 text-primary hover:text-primary/80 hover:border-primary"
                    style={{ height: 32 }}
                  >
                    Add Employee
                  </Button>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={allDayNumbers.length + 1} />
              </Table.Summary.Row>
            )}
          </Table.Summary>
        )}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .rota-details-compact-table .ant-table {
            border-radius: 16px;
            overflow: hidden;
          }
          .rota-details-compact-table .ant-table-thead > tr > th {
            background: #f8fafc !important;
            padding: 8px 6px !important;
            color: #344054 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
            text-transform: uppercase !important;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
            position: sticky !important;
            top: 0;
            z-index: 30;
          }
          .rota-details-compact-table .ant-table-tbody > tr > td {
            padding: 4px 6px !important;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
            background: #ffffff;
            vertical-align: middle;
          }
          .rota-details-compact-table .ant-table-tbody > tr:hover > td {
            background: rgba(15, 23, 42, 0.02) !important;
          }
          .rota-details-compact-table .ant-table-summary {
            background: #f7fdfa;
          }
          .rota-details-compact-table .ant-table-summary > tr > td {
            padding: 8px 6px !important;
            font-size: 11px !important;
            color: #0f172a;
          }
          .rota-details-compact-table .ant-table-cell-fix-left,
          .rota-details-compact-table .ant-table-cell-fix-right {
            background: #ffffff !important;
            z-index: 20 !important;
          }
        `,
        }}
      />
    </div>
  );
}
