import { useState, useMemo, useCallback, useDeferredValue } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useNavigate } from "react-router-dom";

dayjs.extend(isoWeek);



const DEPARTMENTS = [
  "Service",
  "Kitchen",
  "Finance",
  "Logistics",
  "Management",
];
const ROLES = [
  "Waiter",
  "Chef",
  "Cashier",
  "Host",
  "Delivery",
  "Manager",
  "Cleaner",
];
const PAGE_SIZE = 25;

const isWeekend = (dow) => dow === 0 || dow === 6;



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

const staffMap = Object.fromEntries(STAFF_LIST.map((s) => [s.id, s]));



const SHIFTS = [
  { name: "Morning", start: "08:00", end: "16:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Evening", start: "18:00", end: "02:00" },
];

const generateAttendanceForStaff = (staffId) => {
  const records = [];
  const today = dayjs();

  for (let i = 59; i >= 0; i--) {
    const date = today.subtract(i, "day");
    const dow = date.day();

    if (isWeekend(dow)) {
      records.push({
        id: `${staffId}-${date.format("YYYY-MM-DD")}`,
        staffId,
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

    const shiftIndex = (staffId + i) % SHIFTS.length;
    const shift = SHIFTS[shiftIndex];
    const seed = (staffId * 13 + i * 7) % 100;

    let status = "present";
    if (seed > 95) status = "on-leave";
    else if (seed > 85) status = "absent";
    else if (seed > 70) status = "late";

    if (status === "absent" || status === "on-leave") {
      records.push({
        id: `${staffId}-${date.format("YYYY-MM-DD")}`,
        staffId,
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
      id: `${staffId}-${date.format("YYYY-MM-DD")}`,
      staffId,
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

  return records;
};



const attendanceCache = {};

const getAttendanceForStaff = (staffId) => {
  if (!attendanceCache[staffId]) {
    attendanceCache[staffId] = generateAttendanceForStaff(staffId);
  }
  return attendanceCache[staffId];
};



const allRecordsEnriched = STAFF_LIST.flatMap((s) =>
  getAttendanceForStaff(s.id)
)
  .filter((r) => r.status !== "off")
  .map((r) => {
    const s = staffMap[r.staffId];
    return {
      ...r,
      staffName: s.name,
      staffRole: s.role,
      department: s.department,
    };
  });



const formatMinutes = (mins) => {
  if (!mins || mins <= 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const filterByPeriod = (records, period, date) => {
  if (period === "day") {
    const dayStr = date.format("YYYY-MM-DD");
    return records.filter((r) => r.date === dayStr);
  }
  if (period === "week") {
    const start = date.startOf("isoWeek");
    const end = date.endOf("isoWeek");
    return records.filter((r) => {
      const d = dayjs(r.date);
      return (
        (d.isSame(start, "day") || d.isAfter(start, "day")) &&
        (d.isSame(end, "day") || d.isBefore(end, "day"))
      );
    });
  }

  const monthStr = date.format("YYYY-MM");
  return records.filter((r) => r.date.startsWith(monthStr));
};



export { formatMinutes };

export default function useAttendanceTab() {
  const navigate = useNavigate();


  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchRaw, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const search = useDeferredValue(searchRaw);


  const periodRecords = useMemo(
    () => filterByPeriod(allRecordsEnriched, period, selectedDate),
    [period, selectedDate]
  );


  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return periodRecords.filter((r) => {
      if (q && !r.staffName.toLowerCase().includes(q)) return false;
      if (department && r.department !== department) return false;
      if (role && r.staffRole !== role) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [periodRecords, search, department, role, statusFilter]);


  const stats = useMemo(() => {
    const presentCount = periodRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const lateCount = periodRecords.filter((r) => r.status === "late").length;
    const absentCount = periodRecords.filter(
      (r) => r.status === "absent"
    ).length;
    const onLeaveCount = periodRecords.filter(
      (r) => r.status === "on-leave"
    ).length;
    const totalWorkedMins = periodRecords.reduce(
      (a, r) => a + (r.workedMinutes || 0),
      0
    );
    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      onLeave: onLeaveCount,
      workedHours: formatMinutes(totalWorkedMins),
      total: periodRecords.length,
    };
  }, [periodRecords]);


  const totalRecords = filteredRecords.length;

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);


  const hasActiveFilters = !!(searchRaw || department || role || statusFilter);


  const handlePeriodChange = useCallback((p) => {
    setPeriod(p);
    setPage(1);
  }, []);

  const handleDateChange = useCallback((d) => {
    setSelectedDate(d || dayjs());
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleDepartmentChange = useCallback((v) => {
    setDepartment(v);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback((v) => {
    setRole(v);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((v) => {
    setStatus(v);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setDepartment("");
    setRole("");
    setStatus("");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p) => setPage(p), []);

  const handleViewProfile = useCallback(
    (staffId) => navigate(`/staff/${staffId}`),
    [navigate]
  );

  return {

    period,
    selectedDate,
    searchRaw,
    department,
    role,
    statusFilter,
    hasActiveFilters,


    stats,
    pagedRecords,
    totalRecords,
    page,
    pageSize: PAGE_SIZE,


    departments: DEPARTMENTS,
    roles: ROLES,


    handlePeriodChange,
    handleDateChange,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleStatusChange,
    handleClearFilters,
    handlePageChange,
    handleViewProfile,
  };
}
