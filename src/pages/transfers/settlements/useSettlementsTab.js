import { useState, useMemo, useCallback, useDeferredValue } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

// ─── Constants ───────────────────────────────────────────────────────────────

const EXPECTED_MONTHLY_HOURS = 176;
const EXPECTED_MONTHLY_MINS = EXPECTED_MONTHLY_HOURS * 60;

const isWeekend = (dow) => dow === 0 || dow === 6;

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

// ─── Staff List (matches useTransfers STAFF_MEMBERS + department added) ───────

const STAFF_LIST = [
  {
    id: 1,
    name: "Ahmed Hassan",
    role: "Waiter",
    department: "Service",
    salary: 6000,
  },
  {
    id: 2,
    name: "Sarah Mohamed",
    role: "Chef",
    department: "Kitchen",
    salary: 9000,
  },
  {
    id: 3,
    name: "Omar Ali",
    role: "Cashier",
    department: "Finance",
    salary: 5500,
  },
  {
    id: 4,
    name: "Nour Ibrahim",
    role: "Host",
    department: "Service",
    salary: 5000,
  },
  {
    id: 5,
    name: "Karim Saad",
    role: "Delivery",
    department: "Logistics",
    salary: 4500,
  },
  {
    id: 6,
    name: "Layla Mahmoud",
    role: "Manager",
    department: "Management",
    salary: 12000,
  },
  {
    id: 7,
    name: "Youssef Khalil",
    role: "Chef",
    department: "Kitchen",
    salary: 8500,
  },
  {
    id: 8,
    name: "Dina Samy",
    role: "Cleaner",
    department: "Service",
    salary: 3500,
  },
  {
    id: 9,
    name: "Mostafa Adel",
    role: "Waiter",
    department: "Service",
    salary: 5500,
  },
  {
    id: 10,
    name: "Rania Fawzy",
    role: "Cashier",
    department: "Finance",
    salary: 5000,
  },
];

const staffMap = Object.fromEntries(STAFF_LIST.map((s) => [s.id, s]));

// ─── Attendance Generator (same logic, deterministic) ────────────────────────

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
        staffId,
        date: date.format("YYYY-MM-DD"),
        workedMinutes: 0,
        lateMinutes: 0,
        status: "off",
      });
      continue;
    }

    const seed = (staffId * 13 + i * 7) % 100;

    let status = "present";
    if (seed > 95) status = "on-leave";
    else if (seed > 85) status = "absent";
    else if (seed > 70) status = "late";

    if (status === "absent" || status === "on-leave") {
      records.push({
        staffId,
        date: date.format("YYYY-MM-DD"),
        workedMinutes: 0,
        lateMinutes: 0,
        status,
      });
      continue;
    }

    const lateMinutes = status === "late" ? 5 + (seed % 40) : 0;
    const overtimeMinutes = (seed * 3) % 60;
    const workedMinutes = 8 * 60 - 30 - lateMinutes + overtimeMinutes;

    records.push({
      staffId,
      date: date.format("YYYY-MM-DD"),
      workedMinutes,
      lateMinutes,
      status,
    });
  }

  return records;
};

// ─── Attendance Cache ─────────────────────────────────────────────────────────

const attendanceCache = {};

const getAttendance = (staffId) => {
  if (!attendanceCache[staffId]) {
    attendanceCache[staffId] = generateAttendanceForStaff(staffId);
  }
  return attendanceCache[staffId];
};

// ─── Transfers Mock (matches useTransfers generateMockTransfers) ──────────────

const buildTransfers = () => {
  const today = dayjs();
  const currentMonth = today.format("YYYY-MM");
  const lastMonth = today.subtract(1, "month").format("YYYY-MM");

  return [
    {
      id: 1,
      staffId: 1,
      type: "salary",
      amount: 6000,
      status: "completed",
      month: lastMonth,
    },
    {
      id: 2,
      staffId: 2,
      type: "salary",
      amount: 9000,
      status: "completed",
      month: lastMonth,
    },
    {
      id: 3,
      staffId: 1,
      type: "bonus",
      amount: 500,
      status: "completed",
      month: lastMonth,
    },
    {
      id: 4,
      staffId: 3,
      type: "salary",
      amount: 5500,
      status: "processing",
      month: currentMonth,
    },
    {
      id: 5,
      staffId: 5,
      type: "deduction",
      amount: 200,
      status: "completed",
      month: currentMonth,
    },
    {
      id: 6,
      staffId: 6,
      type: "salary",
      amount: 12000,
      status: "pending",
      month: currentMonth,
    },
    {
      id: 7,
      staffId: 7,
      type: "reimbursement",
      amount: 350,
      status: "completed",
      month: currentMonth,
    },
    {
      id: 8,
      staffId: 4,
      type: "salary",
      amount: 5000,
      status: "failed",
      month: currentMonth,
    },
    {
      id: 9,
      staffId: 9,
      type: "salary",
      amount: 5500,
      status: "pending",
      month: currentMonth,
    },
    {
      id: 10,
      staffId: 2,
      type: "bonus",
      amount: 1000,
      status: "pending",
      month: currentMonth,
    },
    {
      id: 11,
      staffId: 8,
      type: "salary",
      amount: 3500,
      status: "completed",
      month: lastMonth,
    },
    {
      id: 12,
      staffId: 10,
      type: "deduction",
      amount: 150,
      status: "processing",
      month: currentMonth,
    },
    {
      id: 13,
      staffId: 1,
      type: "advance",
      amount: 2000,
      status: "completed",
      month: currentMonth,
    },
    {
      id: 14,
      staffId: 5,
      type: "advance",
      amount: 3000,
      status: "pending",
      month: currentMonth,
    },
    {
      id: 15,
      staffId: 7,
      type: "advance",
      amount: 1500,
      status: "completed",
      month: lastMonth,
    },
    {
      id: 16,
      staffId: 9,
      type: "advance",
      amount: 1000,
      status: "processing",
      month: currentMonth,
    },
  ];
};

const ALL_TRANSFERS = buildTransfers();

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

export const formatMinutes = (mins) => {
  if (!mins || mins <= 0) return "0h 0m";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

// ─── Settlement Calculator per staff per month ────────────────────────────────

const calcSettlement = (staff, monthStr) => {
  const attendance = getAttendance(staff.id);

  const monthRecords = attendance.filter(
    (r) => r.date.startsWith(monthStr) && r.status !== "off"
  );

  const workedMins = monthRecords.reduce(
    (a, r) => a + (r.workedMinutes || 0),
    0
  );
  const workedDays = monthRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const absentDays = monthRecords.filter((r) => r.status === "absent").length;
  const absentMins = absentDays * 8 * 60;
  const onLeaveDays = monthRecords.filter(
    (r) => r.status === "on-leave"
  ).length;

  const absenceDeduction =
    absentMins > 0
      ? Math.round((staff.salary / EXPECTED_MONTHLY_MINS) * absentMins)
      : 0;

  const monthTransfers = ALL_TRANSFERS.filter(
    (t) =>
      t.staffId === staff.id && t.month === monthStr && t.status === "completed"
  );

  const advanceAmount = monthTransfers
    .filter((t) => t.type === "advance")
    .reduce((a, t) => a + t.amount, 0);
  const deductionAmount = monthTransfers
    .filter((t) => t.type === "deduction")
    .reduce((a, t) => a + t.amount, 0);
  const bonusAmount = monthTransfers
    .filter((t) => t.type === "bonus")
    .reduce((a, t) => a + t.amount, 0);
  const reimbursementAmount = monthTransfers
    .filter((t) => t.type === "reimbursement")
    .reduce((a, t) => a + t.amount, 0);

  const totalDeductions = absenceDeduction + advanceAmount + deductionAmount;
  const totalAdditions = bonusAmount + reimbursementAmount;
  const netAmount = staff.salary - totalDeductions + totalAdditions;

  return {
    staffId: staff.id,
    staffName: staff.name,
    staffRole: staff.role,
    department: staff.department,
    baseSalary: staff.salary,
    workedDays,
    workedHours: formatMinutes(workedMins),
    workedMins,
    absentDays,
    onLeaveDays,
    absenceDeduction,
    advanceAmount,
    deductionAmount,
    bonusAmount,
    reimbursementAmount,
    totalDeductions,
    totalAdditions,
    netAmount,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useSettlementsTab() {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [searchRaw, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [viewStaff, setViewStaff] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const search = useDeferredValue(searchRaw);

  // ── All settlements for selected month ──────────────────────────────────────
  const monthStr = useMemo(
    () => selectedMonth.format("YYYY-MM"),
    [selectedMonth]
  );

  const allSettlements = useMemo(
    () => STAFF_LIST.map((s) => calcSettlement(s, monthStr)),
    [monthStr]
  );

  // ── Filtered rows ────────────────────────────────────────────────────────────
  const filteredSettlements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSettlements.filter((row) => {
      if (q && !row.staffName.toLowerCase().includes(q)) return false;
      if (department && row.department !== department) return false;
      if (role && row.staffRole !== role) return false;
      return true;
    });
  }, [allSettlements, search, department, role]);

  // ── Stats (from allSettlements — full picture before search/filter) ──────────
  const stats = useMemo(() => {
    const totalPayroll = allSettlements.reduce((a, r) => a + r.baseSalary, 0);
    const totalDeductions = allSettlements.reduce(
      (a, r) => a + r.totalDeductions,
      0
    );
    const totalAdditions = allSettlements.reduce(
      (a, r) => a + r.totalAdditions,
      0
    );
    const netTotal = allSettlements.reduce((a, r) => a + r.netAmount, 0);
    return { totalPayroll, totalDeductions, totalAdditions, netTotal };
  }, [allSettlements]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const hasActiveFilters = !!(searchRaw || department || role);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMonthChange = useCallback((d) => {
    setSelectedMonth(d || dayjs());
  }, []);

  const handleSearchChange = useCallback((v) => setSearch(v), []);
  const handleDepartmentChange = useCallback((v) => setDepartment(v ?? ""), []);
  const handleRoleChange = useCallback((v) => setRole(v ?? ""), []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setDepartment("");
    setRole("");
  }, []);

  const handleViewBreakdown = useCallback((row) => {
    setViewStaff(row);
    setViewModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewModalOpen(false);
    setViewStaff(null);
  }, []);

  return {
    // state
    selectedMonth,
    searchRaw,
    department,
    role,
    hasActiveFilters,

    // data
    stats,
    filteredSettlements,

    // options
    departments: DEPARTMENTS,
    roles: ROLES,

    // modal
    viewModalOpen,
    viewStaff,

    // handlers
    handleMonthChange,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleClearFilters,
    handleViewBreakdown,
    handleCloseModal,
  };
}
