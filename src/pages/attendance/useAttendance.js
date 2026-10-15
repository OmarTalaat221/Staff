import { useState, useMemo, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import toast from "react-hot-toast";
import { getAllStaff } from "../../features/Staff/staffService";
import { getEmployeeLogs, updateAttendanceLog } from "../../features/Attendance/attendanceService";
import { getAllShifts, deleteShift } from "../../features/Schedule/scheduleService";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

const PAGE_SIZE = 10;
const SHIFTS = [
  { name: "Morning", start: "08:00", end: "16:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Evening", start: "18:00", end: "02:00" },
];
const DEPARTMENTS = ["Floor", "Kitchen", "Finance", "Logistics", "Management", "Bar", "Staff Food"];
const ROLES = ["Waiter", "Chef", "Cashier", "Host", "Delivery", "Manager", "Cleaner", "Barista", "Waitress"];

export default function useAttendance() {
  const [viewMode, setViewMode] = useState("matrix"); // "matrix", "week", or "table"
  const [records, setRecords] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(dayjs());

  // Matrix view month and cost toggle
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [showCost, setShowCost] = useState(false);

  // Shift Drawer state for Matrix Grid
  const [shiftDrawerOpen, setShiftDrawerOpen] = useState(false);
  const [shiftDrawerEditShift, setShiftDrawerEditShift] = useState(null);
  const [preSelectedShiftDay, setPreSelectedShiftDay] = useState(null);
  const [preSelectedShiftStaffId, setPreSelectedShiftStaffId] = useState(null);

  // Week view navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("isoWeek"));

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [period, setPeriod] = useState("week");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftTypeFilter, setShiftTypeFilter] = useState("");

  // Pagination & Modals state
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff list & all shifts on mount
  const fetchInitialData = useCallback(async () => {
    try {
      const [staffRes, shiftsRes] = await Promise.allSettled([
        getAllStaff(),
        getAllShifts()
      ]);

      if (staffRes.status === "fulfilled" && staffRes.value?.status === "success" && staffRes.value.data) {
        const list = staffRes.value.data.map(item => ({
          id: item.employee_id,
          name: item.full_name,
          role: item.role || "Staff",
          department: item.department || "General",
          salary: parseFloat(item.salary || 0),
          salary_type: item.salary_type || "Hourly",
        }));
        setStaffList(list);
      }

      if (shiftsRes.status === "fulfilled" && shiftsRes.value?.status === "success" && shiftsRes.value.data) {
        setAllShifts(shiftsRes.value.data);
      }
    } catch (e) {
      console.error("Failed to load initial attendance data", e);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Selected staff details
  const selectedStaff = useMemo(() => {
    return staffList.find(s => String(s.id) === String(selectedStaffId)) || null;
  }, [staffList, selectedStaffId]);

  // daily_tasks comes back as { opening: [lists], closing: [lists] }; flatten to items
  const parseDailyTasks = (raw) => {
    if (!raw || typeof raw !== "object") return [];
    return ["opening", "closing"].flatMap((type) =>
      (raw[type] || []).flatMap((list) =>
        (list.items || []).map((item) => ({
          itemId: item.item_id,
          type,
          listTitle: list.title,
          title: item.title || "",
          done: Number(item.is_done) === 1,
          doneAt: item.done_at || null,
          checkedByName: item.checked_by_name || null,
        }))
      )
    );
  };

  const enrichLogs = useCallback((items, staffMember) => {
    return items.map(item => {
      const checkIn = item.check_in_time ? item.check_in_time.split(" ")[1].substring(0, 5) : null;
      const checkOut = item.check_out_time ? item.check_out_time.split(" ")[1].substring(0, 5) : null;

      let workedMinutes = 0;
      if (checkIn && checkOut) {
        const [inH, inM] = checkIn.split(":").map(Number);
        const [outH, outM] = checkOut.split(":").map(Number);
        workedMinutes = (outH * 60 + outM) - (inH * 60 + inM) - 30;
        if (workedMinutes < 0) workedMinutes = 0;
      }

      const lateMinutes = parseInt(item.late_arrival_minutes || "0");
      const isPastOrToday = dayjs(item.shift_date).isSameOrBefore(dayjs(), "day");
      let status = "scheduled";
      if (item.attendance_id) {
        if (checkIn && !checkOut) {
          status = "on-duty";
        } else if (lateMinutes > 0) {
          status = "late";
        } else {
          status = "present";
        }
      } else {
        status = isPastOrToday ? "absent" : "scheduled";
      }

      return {
        id: item.shift_id,
        attendanceId: item.attendance_id,
        staffId: staffMember.id,
        staffName: staffMember.name,
        staffRole: staffMember.role,
        department: staffMember.department,
        date: item.shift_date,
        shiftName: item.shift_type,
        scheduledStart: item.start_time ? item.start_time.substring(0, 5) : null,
        scheduledEnd: item.end_time ? item.end_time.substring(0, 5) : null,
        checkIn: checkIn ? dayjs(checkIn, "HH:mm").format("h:mm a") : null,
        checkOut: checkOut ? dayjs(checkOut, "HH:mm").format("h:mm a") : null,
        workedMinutes,
        lateMinutes,
        status,
        dailyTasks: parseDailyTasks(item.daily_tasks),
      };
    });
  }, []);

  // Fetch employee logs across selected month and selected date
  const fetchLogs = useCallback(async () => {
    if (staffList.length === 0) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const monthPrefix = selectedMonth.format("YYYY-MM");

      const requestsMap = new Map();

      // 1. Staff logs for selectedDate
      staffList.forEach(s => {
        requestsMap.set(`${s.id}_${dateStr}`, { employee_id: s.id, date: dateStr, staffMember: s });
      });

      // 2. Staff logs for shifts in selectedMonth
      allShifts.forEach(shift => {
        if (shift.shift_date && shift.shift_date.startsWith(monthPrefix)) {
          const key = `${shift.employee_id}_${shift.shift_date}`;
          if (!requestsMap.has(key)) {
            const s = staffList.find(item => String(item.id) === String(shift.employee_id)) || {
              id: shift.employee_id,
              name: shift.full_name || "Staff",
              role: shift.role || "Staff",
              department: "General"
            };
            requestsMap.set(key, { employee_id: shift.employee_id, date: shift.shift_date, staffMember: s });
          }
        }
      });

      const requestItems = Array.from(requestsMap.values());
      const results = await Promise.allSettled(
        requestItems.map(item => getEmployeeLogs(item.employee_id, item.date))
      );

      const allRecords = [];
      results.forEach((res, i) => {
        const item = requestItems[i];
        if (res.status === "fulfilled" && res.value?.status === "success" && Array.isArray(res.value.data) && res.value.data.length > 0) {
          allRecords.push(...enrichLogs(res.value.data, item.staffMember));
        }
      });

      setRecords(allRecords);
    } catch (e) {
      console.error("Failed to load logs", e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [staffList, allShifts, selectedDate, selectedMonth, enrichLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filters logic
  const filteredRecords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return records.filter((r) => {
      if (q && !r.staffName.toLowerCase().includes(q)) return false;
      if (department && r.department !== department) return false;
      if (role && r.staffRole !== role) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, searchText, department, role, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const late = filteredRecords.filter((r) => r.status === "late").length;
    const absent = filteredRecords.filter((r) => r.status === "absent").length;

    const workingDays = filteredRecords.filter((r) => r.status === "present" || r.status === "late");
    const totalMinutes = workingDays.reduce((sum, r) => sum + (r.workedMinutes || 0), 0);
    const avgMins = workingDays.length > 0 ? totalMinutes / workingDays.length : 0;
    const avgH = Math.floor(avgMins / 60);
    const avgM = Math.round(avgMins % 60);
    const averageHoursFormatted = `${avgH}h ${avgM}m`;

    return {
      total,
      present,
      late,
      absent,
      onLeave: 0,
      averageHours: averageHoursFormatted,
    };
  }, [filteredRecords]);

  const totalCount = filteredRecords.length;

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  const hasActiveFilters = !!(searchText || department || role || statusFilter || shiftTypeFilter || selectedStaffId);

  const handleClearFilters = useCallback(() => {
    setSearchText("");
    setDepartment("");
    setRole("");
    setStatusFilter("");
    setShiftTypeFilter("");
    setSelectedStaffId(null);
    setPage(1);
  }, []);

  // Week navigation & calculations (Matching Schedule / Rota week view)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = currentWeekStart.add(i, "day");
      days.push({
        date: d.format("YYYY-MM-DD"),
        dayName: d.format("ddd"),
        fullDayName: d.format("dddd"),
        dayNumber: d.format("DD"),
        monthName: d.format("MMM"),
        isToday: d.isSame(dayjs(), "day"),
      });
    }
    return days;
  }, [currentWeekStart]);

  const weekLabel = useMemo(() => {
    const start = currentWeekStart.format("DD MMM");
    const end = currentWeekStart.add(6, "day").format("DD MMM YYYY");
    return `${start} – ${end}`;
  }, [currentWeekStart]);

  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev.subtract(1, "week"));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev.add(1, "week"));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(dayjs().startOf("isoWeek"));
    setSelectedDate(dayjs());
  }, []);

  // Grouped records for Schedule Week View
  const groupedWeekRecords = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => {
      grouped[day.date] = [];
    });

    const weekDates = weekDays.map((d) => d.date);

    // 1. Collect all shifts belonging to this week
    allShifts.forEach((shift) => {
      if (weekDates.includes(shift.shift_date)) {
        const attMatch = records.find(
          (r) =>
            (r.id && String(r.id) === String(shift.shift_id)) ||
            (String(r.staffId) === String(shift.employee_id) && r.date === shift.shift_date)
        );

        const staffMember = staffList.find((s) => String(s.id) === String(shift.employee_id)) || {};
        const isFuture = dayjs(shift.shift_date).isAfter(dayjs(), "day");

        const record = {
          id: shift.shift_id,
          shiftId: shift.shift_id,
          attendanceId: attMatch?.attendanceId || null,
          staffId: shift.employee_id,
          staffName: shift.full_name || staffMember.name || "Staff",
          staffRole: shift.role || staffMember.role || "Staff",
          department: staffMember.department || "General",
          date: shift.shift_date,
          shiftName: shift.shift_type,
          shiftType: (shift.shift_type || "morning").toLowerCase(),
          scheduledStart: shift.start_time ? shift.start_time.substring(0, 5) : null,
          scheduledEnd: shift.end_time ? shift.end_time.substring(0, 5) : null,
          checkIn: attMatch?.checkIn || null,
          checkOut: attMatch?.checkOut || null,
          workedMinutes: attMatch?.workedMinutes || 0,
          lateMinutes: attMatch?.lateMinutes || 0,
          dailyTasks: attMatch?.dailyTasks || [],
          status: attMatch ? attMatch.status : isFuture ? "scheduled" : "absent",
        };

        // Filter checks
        const q = searchText.trim().toLowerCase();
        if (q && !record.staffName.toLowerCase().includes(q)) return;
        if (department && record.department !== department) return;
        if (role && record.staffRole !== role) return;
        if (statusFilter && record.status !== statusFilter) return;
        if (selectedStaffId && String(record.staffId) !== String(selectedStaffId)) return;
        if (shiftTypeFilter && record.shiftType !== shiftTypeFilter.toLowerCase()) return;

        grouped[shift.shift_date].push(record);
      }
    });

    // 2. Add any records in `records` for this week not in allShifts
    records.forEach((r) => {
      if (weekDates.includes(r.date)) {
        const alreadyAdded = grouped[r.date]?.some(
          (item) =>
            (item.id && String(item.id) === String(r.id)) ||
            (String(item.staffId) === String(r.staffId) && item.date === r.date)
        );

        if (!alreadyAdded) {
          const q = searchText.trim().toLowerCase();
          if (q && !r.staffName.toLowerCase().includes(q)) return;
          if (department && r.department !== department) return;
          if (role && r.staffRole !== role) return;
          if (statusFilter && r.status !== statusFilter) return;
          if (selectedStaffId && String(r.staffId) !== String(selectedStaffId)) return;
          if (shiftTypeFilter && (r.shiftName || "").toLowerCase() !== shiftTypeFilter.toLowerCase()) return;

          grouped[r.date].push(r);
        }
      }
    });

    return grouped;
  }, [allShifts, records, weekDays, staffList, searchText, department, role, statusFilter, selectedStaffId, shiftTypeFilter]);

  // Modals operations
  const handleOpenAdd = (date = null) => {
    setPreSelectedDate(date ? dayjs(date) : null);
    setAddModalOpen(true);
  };
  const handleConfirmAdd = useCallback(async (values) => {
    try {
      const date = dayjs(values.date).format("YYYY-MM-DD");
      const toFullDateTime = (timeVal) =>
        timeVal ? `${date} ${dayjs(timeVal).format("HH:mm:ss")}` : null;
      const shift = allShifts.find(
        (s) => String(s.employee_id) === String(values.staffId) && s.shift_date === date
      );
      if (!shift?.shift_id) {
        toast.error(`No scheduled shift for this staff member on ${date}. Add it from the Schedule first.`);
        return;
      }

      const res = await updateAttendanceLog({
        employee_id: values.staffId,
        shift_id: shift?.shift_id || undefined,
        date,
        check_in_time: toFullDateTime(values.checkIn),
        check_out_time: toFullDateTime(values.checkOut),
        // left out unless entered manually, so the backend calculates it from the shift start
        late_arrival_minutes: values.lateMinutes === "" || values.lateMinutes == null ? undefined : Number(values.lateMinutes),
      });
      if (res?.status === "success") {
        toast.success("Attendance log created successfully!");
        setAddModalOpen(false);
        fetchLogs();
      } else {
        toast.error(res?.message || "Create failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Create failed");
    }
  }, [allShifts, fetchLogs]);

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditModalOpen(true);
  };

  const handleConfirmEdit = useCallback(async (values) => {
    if (!editingRecord) return;
    try {
      const date = editingRecord.date; // "YYYY-MM-DD"
      const toFullDateTime = (timeVal) => {
        if (!timeVal) return null;
        const t = dayjs(timeVal).format("HH:mm:ss");
        return `${date} ${t}`;
      };

      const payload = {
        employee_id: editingRecord.staffId,
        shift_id: editingRecord.id,
        attendance_id: editingRecord.attendanceId || undefined,
        date,
        check_in_time: toFullDateTime(values.checkIn),
        check_out_time: toFullDateTime(values.checkOut),
        late_arrival_minutes: values.lateMinutes === "" || values.lateMinutes == null ? undefined : Number(values.lateMinutes),
      };

      const res = await updateAttendanceLog(payload);
      if (res?.status === "success") {
        toast.success("Attendance updated successfully!");
        setEditModalOpen(false);
        setEditingRecord(null);
        fetchLogs();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  }, [editingRecord, fetchLogs]);

  const refreshShifts = useCallback(async () => {
    try {
      const res = await getAllShifts();
      if (res && res.status === "success" && res.data) {
        setAllShifts(res.data);
      }
    } catch (e) {
      console.error("Failed to refresh shifts", e);
    }
  }, []);

  const handleDeleteShift = useCallback(async (shift) => {
    try {
      const shiftId = Number(shift.shift_id || shift.id);
      const res = await deleteShift(shiftId);
      if (res && res.status === "success") {
        toast.success("Shift removed successfully");
        refreshShifts();
      } else {
        toast.error(res?.message || "Failed to delete shift");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  }, [refreshShifts]);

  const handleOpenAddShift = useCallback((day = null, staffId = null) => {
    setShiftDrawerEditShift(null);
    setPreSelectedShiftDay(day || 1);
    setPreSelectedShiftStaffId(staffId ? String(staffId) : (staffList[0]?.id ? String(staffList[0].id) : null));
    setShiftDrawerOpen(true);
  }, [staffList]);

  const handleOpenEditShift = useCallback((shift) => {
    setShiftDrawerEditShift(shift);
    setShiftDrawerOpen(true);
  }, []);

  const handleCloseShiftDrawer = useCallback(() => {
    setShiftDrawerOpen(false);
    setShiftDrawerEditShift(null);
  }, []);

  const displayStaffList = useMemo(() => {
    let list = staffList;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((s) => (s.name || "").toLowerCase().includes(q) || (s.role || "").toLowerCase().includes(q));
    }
    if (department) {
      list = list.filter((s) => s.department === department);
    }
    if (role) {
      list = list.filter((s) => s.role === role);
    }
    return list;
  }, [staffList, searchText, department, role]);

  const handleDeleteRecord = useCallback(() => {
    toast.error("Delete record is not configured for backend.");
  }, []);

  return {
    records: pagedRecords,
    allRecords: records,
    allShifts,
    totalCount,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    stats,
    liveTime,
    staffList,
    displayStaffList,
    shifts: SHIFTS,
    departments: DEPARTMENTS,
    roles: ROLES,
    loading,

    // Matrix View controls
    selectedMonth,
    setSelectedMonth,
    showCost,
    setShowCost,
    shiftDrawerOpen,
    shiftDrawerEditShift,
    preSelectedShiftDay,
    preSelectedShiftStaffId,
    handleOpenAddShift,
    handleOpenEditShift,
    handleCloseShiftDrawer,
    handleDeleteShift,
    refreshShifts,

    // View mode (Matrix Grid vs Week View vs Table View)
    viewMode,
    setViewMode,

    // Week navigation & grouped data
    currentWeekStart,
    setCurrentWeekStart,
    weekDays,
    weekLabel,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    groupedWeekRecords,
    shiftTypeFilter,
    setShiftTypeFilter,

    // Selected Employee State
    selectedStaffId,
    setSelectedStaffId,
    selectedStaff,
    todayRecordForSelected: null,
    workedLiveTime: null,
    handleClockIn: () => { },
    handleClockOut: () => { },

    // Filters
    searchText,
    setSearchText,
    period,
    setPeriod,
    selectedDate,
    setSelectedDate,
    department,
    setDepartment,
    role,
    setRole,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    handleClearFilters,

    // Modals
    addModalOpen,
    setAddModalOpen,
    handleOpenAdd,
    handleConfirmAdd,
    editModalOpen,
    setEditModalOpen,
    editingRecord,
    setEditingRecord,
    handleOpenEdit,
    handleConfirmEdit,
    handleDeleteRecord,
    preSelectedDate,
    refetch: fetchLogs,
  };
}
