import { useState, useMemo, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";

dayjs.extend(isoWeek);

const STORAGE_KEY = "nm_attendance_records";

const DEPARTMENTS = ["Service", "Kitchen", "Finance", "Logistics", "Management"];
const ROLES = ["Waiter", "Chef", "Cashier", "Host", "Delivery", "Manager", "Cleaner"];
const PAGE_SIZE = 10;

const STAFF_LIST = [
  { id: 1, name: "Ahmed Hassan", role: "Waiter", department: "Service" },
  { id: 2, name: "Sara Ali", role: "Chef", department: "Kitchen" },
  { id: 3, name: "Mohamed Youssef", role: "Cashier", department: "Finance" },
  { id: 4, name: "Fatma Omar", role: "Waiter", department: "Service" },
  { id: 5, name: "Khaled Mahmoud", role: "Chef", department: "Kitchen" },
  { id: 6, name: "Nour Ibrahim", role: "Host", department: "Service" },
  { id: 7, name: "Omar Adel", role: "Delivery", department: "Logistics" },
  { id: 8, name: "Yara Mostafa", role: "Manager", department: "Management" },
];

const SHIFTS = [
  { name: "Morning", start: "08:00", end: "16:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Evening", start: "18:00", end: "02:00" },
];

const staffMap = Object.fromEntries(STAFF_LIST.map((s) => [s.id, s]));

// Check if weekend
const isWeekend = (dow) => dow === 0 || dow === 6;

// Generate 60 days of mock attendance
const generateMockAttendance = () => {
  const records = [];
  const today = dayjs();

  for (let sId = 1; sId <= 8; sId++) {
    const s = staffMap[sId];
    for (let i = 59; i >= 1; i--) { // i >= 1 so today is open for live clock-in/out!
      const date = today.subtract(i, "day");
      const dow = date.day();

      if (isWeekend(dow)) {
        records.push({
          id: `${sId}-${date.format("YYYY-MM-DD")}`,
          staffId: sId,
          staffName: s.name,
          staffRole: s.role,
          department: s.department,
          date: date.format("YYYY-MM-DD"),
          shiftName: null,
          scheduledStart: null,
          scheduledEnd: null,
          checkIn: null,
          checkOut: null,
          breakMinutes: 0,
          workedMinutes: 0,
          lateMinutes: 0,
          overtimeMinutes: 0,
          status: "off",
        });
        continue;
      }

      const shiftIndex = (sId + i) % SHIFTS.length;
      const shift = SHIFTS[shiftIndex];
      const seed = (sId * 13 + i * 7) % 100;

      let status = "present";
      if (seed > 95) status = "on-leave";
      else if (seed > 85) status = "absent";
      else if (seed > 70) status = "late";

      if (status === "absent" || status === "on-leave") {
        records.push({
          id: `${sId}-${date.format("YYYY-MM-DD")}`,
          staffId: sId,
          staffName: s.name,
          staffRole: s.role,
          department: s.department,
          date: date.format("YYYY-MM-DD"),
          shiftName: shift.name,
          scheduledStart: shift.start,
          scheduledEnd: shift.end,
          checkIn: null,
          checkOut: null,
          breakMinutes: 30,
          workedMinutes: 0,
          lateMinutes: 0,
          overtimeMinutes: 0,
          status,
        });
        continue;
      }

      const lateMinutes = status === "late" ? 5 + (seed % 40) : 0;
      const overtimeMinutes = (seed * 3) % 60;
      const breakMinutes = 30;
      const workedMinutes = 8 * 60 - breakMinutes - lateMinutes + overtimeMinutes;

      const [startH, startM] = shift.start.split(":").map(Number);
      const ciTotal = startH * 60 + startM + lateMinutes;
      const checkIn = `${String(Math.floor(ciTotal / 60) % 24).padStart(2, "0")}:${String(ciTotal % 60).padStart(2, "0")}`;

      const [endH, endM] = shift.end.split(":").map(Number);
      const coTotal = endH * 60 + endM + overtimeMinutes;
      const checkOut = `${String(Math.floor(coTotal / 60) % 24).padStart(2, "0")}:${String(coTotal % 60).padStart(2, "0")}`;

      records.push({
        id: `${sId}-${date.format("YYYY-MM-DD")}`,
        staffId: sId,
        staffName: s.name,
        staffRole: s.role,
        department: s.department,
        date: date.format("YYYY-MM-DD"),
        shiftName: shift.name,
        scheduledStart: shift.start,
        scheduledEnd: shift.end,
        checkIn,
        checkOut,
        breakMinutes,
        workedMinutes,
        lateMinutes,
        overtimeMinutes,
        status,
      });
    }
  }

  // Sort descending by date
  return records.sort((a, b) => b.date.localeCompare(a.date));
};

export default function useAttendance() {
  const [records, setRecords] = useState([]);
  const [liveTime, setLiveTime] = useState(dayjs());

  // Clock widget state
  const [selectedStaffId, setSelectedStaffId] = useState(1);
  const [selectedShift, setSelectedShift] = useState("Morning");

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination & Modals state
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored attendance", e);
        const initial = generateMockAttendance();
        setRecords(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } else {
      const initial = generateMockAttendance();
      setRecords(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save records helper
  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  };

  // Find selected staff details
  const selectedStaff = useMemo(() => staffMap[selectedStaffId] || STAFF_LIST[0], [selectedStaffId]);

  // Check if selected staff is clocked in today
  const todayRecordForSelected = useMemo(() => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    return records.find((r) => r.staffId === selectedStaffId && r.date === todayStr && r.status !== "off") || null;
  }, [records, selectedStaffId]);

  // Live work duration counter
  const workedLiveTime = useMemo(() => {
    if (!todayRecordForSelected || !todayRecordForSelected.checkIn || todayRecordForSelected.checkOut) return null;

    const todayStr = dayjs().format("YYYY-MM-DD");
    const [inH, inM] = todayRecordForSelected.checkIn.split(":").map(Number);
    const checkInDateTime = dayjs(`${todayStr}T${String(inH).padStart(2, "0")}:${String(inM).padStart(2, "0")}:00`);

    const diffSecs = liveTime.diff(checkInDateTime, "second");
    if (diffSecs < 0) return "00:00:00";

    const h = Math.floor(diffSecs / 3600);
    const m = Math.floor((diffSecs % 3600) / 60);
    const s = diffSecs % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [todayRecordForSelected, liveTime]);

  // Handle Clock In
  const handleClockIn = useCallback((staffId, shiftName) => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const currentShift = SHIFTS.find((s) => s.name === shiftName) || SHIFTS[0];
    const s = staffMap[staffId];

    if (!s) {
      toast.error("Invalid staff member selected!");
      return;
    }

    // Check if already clocked in
    const existing = records.find((r) => r.staffId === staffId && r.date === todayStr);
    if (existing && existing.checkIn) {
      toast.error(`${s.name} is already clocked in today!`);
      return;
    }

    const checkInTimeStr = dayjs().format("HH:mm");
    
    // Calculate if late
    const [schedH, schedM] = currentShift.start.split(":").map(Number);
    const [actH, actM] = checkInTimeStr.split(":").map(Number);
    
    const schedTotal = schedH * 60 + schedM;
    const actTotal = actH * 60 + actM;
    const diff = actTotal - schedTotal;

    const isLate = diff > 5; // 5-minute grace period
    const lateMinutes = isLate ? diff : 0;
    const status = isLate ? "late" : "present";

    const newRecord = {
      id: `${staffId}-${todayStr}`,
      staffId,
      staffName: s.name,
      staffRole: s.role,
      department: s.department,
      date: todayStr,
      shiftName: currentShift.name,
      scheduledStart: currentShift.start,
      scheduledEnd: currentShift.end,
      checkIn: checkInTimeStr,
      checkOut: null,
      breakMinutes: 30,
      workedMinutes: 0,
      lateMinutes,
      overtimeMinutes: 0,
      status,
    };

    let updated;
    if (existing) {
      // Overwrite off / absent / on-leave
      updated = records.map((r) => (r.id === existing.id ? newRecord : r));
    } else {
      updated = [newRecord, ...records];
    }

    saveRecords(updated);
    toast.success(`${s.name} clocked in successfully at ${checkInTimeStr}!`);
  }, [records]);

  // Handle Clock Out
  const handleClockOut = useCallback((staffId) => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const s = staffMap[staffId];

    if (!s) return;

    const existing = records.find((r) => r.staffId === staffId && r.date === todayStr);
    if (!existing || !existing.checkIn) {
      toast.error(`${s.name} is not clocked in today!`);
      return;
    }

    if (existing.checkOut) {
      toast.error(`${s.name} has already clocked out today!`);
      return;
    }

    const checkOutTimeStr = dayjs().format("HH:mm");

    // Calculate worked minutes
    const [inH, inM] = existing.checkIn.split(":").map(Number);
    const [outH, outM] = checkOutTimeStr.split(":").map(Number);
    
    let workedMinutes = (outH * 60 + outM) - (inH * 60 + inM) - (existing.breakMinutes || 30);
    if (workedMinutes < 0) workedMinutes = 0;

    // Calculate overtime
    const [schedEndH, schedEndM] = (existing.scheduledEnd || "16:00").split(":").map(Number);
    const schedEndTotal = schedEndH * 60 + schedEndM;
    const actOutTotal = outH * 60 + outM;
    const overtimeDiff = actOutTotal - schedEndTotal;
    const overtimeMinutes = overtimeDiff > 0 ? overtimeDiff : 0;

    const updatedRecord = {
      ...existing,
      checkOut: checkOutTimeStr,
      workedMinutes,
      overtimeMinutes,
    };

    const updated = records.map((r) => (r.id === existing.id ? updatedRecord : r));
    saveRecords(updated);
    toast.success(`${s.name} clocked out successfully at ${checkOutTimeStr}!`);
  }, [records]);

  // Filter records by date/period
  const periodFiltered = useMemo(() => {
    return records.filter((r) => {
      if (r.status === "off") return false; // Hide weekend offs by default to keep logs clean

      const d = dayjs(r.date);
      if (period === "day") {
        return d.isSame(selectedDate, "day");
      } else if (period === "week") {
        const start = selectedDate.startOf("isoWeek");
        const end = selectedDate.endOf("isoWeek");
        return (d.isSame(start, "day") || d.isAfter(start, "day")) && (d.isSame(end, "day") || d.isBefore(end, "day"));
      } else {
        return d.isSame(selectedDate, "month");
      }
    });
  }, [records, period, selectedDate]);

  // Apply other search & drop-down filters
  const filteredRecords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return periodFiltered.filter((r) => {
      if (q && !r.staffName.toLowerCase().includes(q)) return false;
      if (department && r.department !== department) return false;
      if (role && r.staffRole !== role) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [periodFiltered, searchText, department, role, statusFilter]);

  // Compute stats in current period filter
  const stats = useMemo(() => {
    const total = periodFiltered.length;
    const present = periodFiltered.filter((r) => r.status === "present" || r.status === "late").length;
    const late = periodFiltered.filter((r) => r.status === "late").length;
    const absent = periodFiltered.filter((r) => r.status === "absent").length;
    const onLeave = periodFiltered.filter((r) => r.status === "on-leave").length;
    
    // Average hours worked
    const workingDays = periodFiltered.filter((r) => r.status === "present" || r.status === "late");
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
      onLeave,
      averageHours: averageHoursFormatted,
    };
  }, [periodFiltered]);

  // Total records count after all filters
  const totalCount = filteredRecords.length;

  // Pagination slice
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  const hasActiveFilters = !!(searchText || department || role || statusFilter);

  const handleClearFilters = useCallback(() => {
    setSearchText("");
    setDepartment("");
    setRole("");
    setStatusFilter("");
    setPage(1);
  }, []);

  // Add / Edit Manual actions
  const handleOpenAdd = () => {
    setAddModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditModalOpen(true);
  };

  const handleConfirmAdd = (values) => {
    const todayStr = values.date.format("YYYY-MM-DD");
    const s = staffMap[values.staffId];
    const currentShift = SHIFTS.find((sh) => sh.name === values.shiftName) || SHIFTS[0];

    if (!s) return;

    // Check if record already exists
    const recId = `${values.staffId}-${todayStr}`;
    const exists = records.some((r) => r.id === recId);
    if (exists) {
      toast.error(`Attendance record already exists for ${s.name} on ${todayStr}!`);
      return;
    }

    const checkIn = values.checkIn ? values.checkIn.format("HH:mm") : null;
    const checkOut = values.checkOut ? values.checkOut.format("HH:mm") : null;

    let workedMinutes = 0;
    let overtimeMinutes = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(":").map(Number);
      const [outH, outM] = checkOut.split(":").map(Number);
      workedMinutes = (outH * 60 + outM) - (inH * 60 + inM) - 30; // 30 min break
      if (workedMinutes < 0) workedMinutes = 0;

      const [endH, endM] = currentShift.end.split(":").map(Number);
      const overtimeDiff = (outH * 60 + outM) - (endH * 60 + endM);
      overtimeMinutes = overtimeDiff > 0 ? overtimeDiff : 0;
    }

    const newRecord = {
      id: recId,
      staffId: values.staffId,
      staffName: s.name,
      staffRole: s.role,
      department: s.department,
      date: todayStr,
      shiftName: currentShift.name,
      scheduledStart: currentShift.start,
      scheduledEnd: currentShift.end,
      checkIn,
      checkOut,
      breakMinutes: 30,
      workedMinutes,
      lateMinutes: values.lateMinutes || 0,
      overtimeMinutes,
      status: values.status,
    };

    saveRecords([newRecord, ...records]);
    setAddModalOpen(false);
    toast.success("Attendance record added successfully!");
  };

  const handleConfirmEdit = (values) => {
    if (!editingRecord) return;

    const checkIn = values.checkIn ? values.checkIn.format("HH:mm") : null;
    const checkOut = values.checkOut ? values.checkOut.format("HH:mm") : null;
    const currentShift = SHIFTS.find((sh) => sh.name === values.shiftName) || SHIFTS[0];

    let workedMinutes = 0;
    let overtimeMinutes = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(":").map(Number);
      const [outH, outM] = checkOut.split(":").map(Number);
      workedMinutes = (outH * 60 + outM) - (inH * 60 + inM) - 30; // 30 min break
      if (workedMinutes < 0) workedMinutes = 0;

      const [endH, endM] = currentShift.end.split(":").map(Number);
      const overtimeDiff = (outH * 60 + outM) - (endH * 60 + endM);
      overtimeMinutes = overtimeDiff > 0 ? overtimeDiff : 0;
    }

    const updatedRecord = {
      ...editingRecord,
      shiftName: currentShift.name,
      scheduledStart: currentShift.start,
      scheduledEnd: currentShift.end,
      checkIn,
      checkOut,
      workedMinutes,
      overtimeMinutes,
      lateMinutes: values.lateMinutes || 0,
      status: values.status,
    };

    const updated = records.map((r) => (r.id === editingRecord.id ? updatedRecord : r));
    saveRecords(updated);
    setEditModalOpen(false);
    setEditingRecord(null);
    toast.success("Attendance record updated successfully!");
  };

  const handleDeleteRecord = (recordId) => {
    const updated = records.filter((r) => r.id !== recordId);
    saveRecords(updated);
    toast.success("Attendance record deleted successfully!");
  };

  return {
    records: pagedRecords,
    totalCount,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    stats,
    liveTime,
    staffList: STAFF_LIST,
    shifts: SHIFTS,
    departments: DEPARTMENTS,
    roles: ROLES,

    // Clock state & functions
    selectedStaffId,
    setSelectedStaffId,
    selectedStaff,
    selectedShift,
    setSelectedShift,
    todayRecordForSelected,
    workedLiveTime,
    handleClockIn,
    handleClockOut,

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
    handleOpenEdit,
    handleConfirmEdit,
    handleDeleteRecord,
  };
}
