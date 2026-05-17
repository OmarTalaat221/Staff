import { useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";






const EXPECTED_MONTHLY_HOURS = 176;

const isWeekend = (dow) => dow === 0 || dow === 6;



const generateAttendance = (staffId) => {
  const records = [];
  const today = dayjs();
  const shifts = [
    { name: "Morning", start: "08:00", end: "16:00" },
    { name: "Afternoon", start: "14:00", end: "22:00" },
    { name: "Evening", start: "18:00", end: "02:00" },
  ];

  for (let i = 59; i >= 0; i--) {
    const date = today.subtract(i, "day");
    const dayOfWeek = date.day();


    if (isWeekend(dayOfWeek)) {
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

    const shiftIndex = (staffId + i) % shifts.length;
    const shift = shifts[shiftIndex];


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

    const shiftMinutes = 8 * 60;
    const breakMinutes = 30;
    const workedMinutes =
      shiftMinutes - breakMinutes - lateMinutes + overtimeMinutes;

    const [startH, startM] = shift.start.split(":").map(Number);
    const checkInTotal = startH * 60 + startM + lateMinutes;
    const checkInH = Math.floor(checkInTotal / 60) % 24;
    const checkInM = checkInTotal % 60;
    const checkIn = `${String(checkInH).padStart(2, "0")}:${String(checkInM).padStart(2, "0")}`;

    const [endH, endM] = shift.end.split(":").map(Number);
    const checkOutTotal = endH * 60 + endM + overtimeMinutes;
    const checkOutH = Math.floor(checkOutTotal / 60) % 24;
    const checkOutM = checkOutTotal % 60;
    const checkOut = `${String(checkOutH).padStart(2, "0")}:${String(checkOutM).padStart(2, "0")}`;

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
const getAttendance = (staffId) => {
  if (!attendanceCache[staffId]) {
    attendanceCache[staffId] = generateAttendance(staffId);
  }
  return attendanceCache[staffId];
};



const allLeaves = [
  {
    id: 1,
    staffId: 1,
    type: "annual",
    startDate: "2025-01-13",
    endDate: "2025-01-15",
    days: 3,
    reason: "Family vacation",
    status: "approved",
    createdAt: "2025-01-05",
  },
  {
    id: 2,
    staffId: 1,
    type: "sick",
    startDate: "2025-02-03",
    endDate: "2025-02-04",
    days: 2,
    reason: "Illness",
    status: "approved",
    createdAt: "2025-02-03",
  },
  {
    id: 3,
    staffId: 2,
    type: "personal",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    days: 1,
    reason: "Personal matters",
    status: "pending",
    createdAt: "2025-01-18",
  },
  {
    id: 4,
    staffId: 3,
    type: "annual",
    startDate: "2025-03-03",
    endDate: "2025-03-07",
    days: 5,
    reason: "Vacation",
    status: "approved",
    createdAt: "2025-02-20",
  },
  {
    id: 5,
    staffId: 4,
    type: "sick",
    startDate: "2025-02-17",
    endDate: "2025-02-18",
    days: 2,
    reason: "Flu",
    status: "rejected",
    createdAt: "2025-02-14",
  },
  {
    id: 6,
    staffId: 5,
    type: "unpaid",
    startDate: "2025-01-27",
    endDate: "2025-01-28",
    days: 2,
    reason: "Emergency",
    status: "approved",
    createdAt: "2025-01-24",
  },
  {
    id: 7,
    staffId: 6,
    type: "annual",
    startDate: "2025-04-01",
    endDate: "2025-04-03",
    days: 3,
    reason: "Travel",
    status: "pending",
    createdAt: "2025-03-25",
  },
  {
    id: 8,
    staffId: 7,
    type: "personal",
    startDate: "2025-02-10",
    endDate: "2025-02-10",
    days: 1,
    reason: "Personal",
    status: "approved",
    createdAt: "2025-02-07",
  },
  {
    id: 9,
    staffId: 8,
    type: "annual",
    startDate: "2025-03-17",
    endDate: "2025-03-21",
    days: 5,
    reason: "Annual leave",
    status: "approved",
    createdAt: "2025-03-10",
  },
];



const currentMonth = dayjs().format("YYYY-MM");
const lastMonth = dayjs().subtract(1, "month").format("YYYY-MM");

const allTransfers = [
  {
    id: 1,
    staffId: 1,
    type: "salary",
    amount: 5000,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-001",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 2,
    staffId: 1,
    type: "advance",
    amount: 1000,
    method: "cash",
    status: "completed",
    month: currentMonth,
    reference: "TRF-002",
    createdAt: dayjs().subtract(10, "day").format("YYYY-MM-DD"),
  },
  {
    id: 3,
    staffId: 1,
    type: "bonus",
    amount: 500,
    method: "bank-transfer",
    status: "completed",
    month: currentMonth,
    reference: "TRF-003",
    createdAt: dayjs().subtract(5, "day").format("YYYY-MM-DD"),
  },
  {
    id: 4,
    staffId: 2,
    type: "salary",
    amount: 8000,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-004",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 5,
    staffId: 2,
    type: "deduction",
    amount: 500,
    method: "bank-transfer",
    status: "completed",
    month: currentMonth,
    reference: "TRF-005",
    createdAt: dayjs().subtract(8, "day").format("YYYY-MM-DD"),
  },
  {
    id: 6,
    staffId: 3,
    type: "salary",
    amount: 4500,
    method: "bank-transfer",
    status: "pending",
    month: currentMonth,
    reference: "TRF-006",
    createdAt: dayjs().format("YYYY-MM-DD"),
  },
  {
    id: 7,
    staffId: 4,
    type: "salary",
    amount: 5000,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-007",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 8,
    staffId: 4,
    type: "reimbursement",
    amount: 200,
    method: "cash",
    status: "completed",
    month: currentMonth,
    reference: "TRF-008",
    createdAt: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
  },
  {
    id: 9,
    staffId: 5,
    type: "salary",
    amount: 7500,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-009",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 10,
    staffId: 6,
    type: "salary",
    amount: 4000,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-010",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 11,
    staffId: 7,
    type: "salary",
    amount: 3500,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-011",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 12,
    staffId: 7,
    type: "advance",
    amount: 800,
    method: "cash",
    status: "completed",
    month: currentMonth,
    reference: "TRF-012",
    createdAt: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  },
  {
    id: 13,
    staffId: 8,
    type: "salary",
    amount: 12000,
    method: "bank-transfer",
    status: "completed",
    month: lastMonth,
    reference: "TRF-013",
    createdAt: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  {
    id: 14,
    staffId: 8,
    type: "bonus",
    amount: 2000,
    method: "bank-transfer",
    status: "completed",
    month: currentMonth,
    reference: "TRF-014",
    createdAt: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
  },
];



const today = dayjs();
const allSchedules = [];
let scheduleId = 1;

for (let staffId = 1; staffId <= 8; staffId++) {
  for (let i = 0; i < 14; i++) {
    const date = today.add(i, "day");
    const dow = date.day();
    if (isWeekend(dow)) continue;

    const periods = [
      { period: "Morning", startTime: "08:00", endTime: "16:00" },
      { period: "Afternoon", startTime: "14:00", endTime: "22:00" },
      { period: "Evening", startTime: "18:00", endTime: "02:00" },
    ];
    const p = periods[(staffId + i) % periods.length];

    allSchedules.push({
      id: scheduleId++,
      staffId,
      date: date.format("YYYY-MM-DD"),
      period: p.period,
      startTime: p.startTime,
      endTime: p.endTime,
      breakMinutes: 30,
    });
  }
}



const staffList = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed@restaurant.com",
    phone: "+20 100 123 4567",
    role: "Waiter",
    department: "Service",
    status: "active",
    joinDate: "2024-01-15",
    salary: 5000,
  },
  {
    id: 2,
    name: "Sara Ali",
    email: "sara@restaurant.com",
    phone: "+20 101 234 5678",
    role: "Chef",
    department: "Kitchen",
    status: "active",
    joinDate: "2023-11-20",
    salary: 8000,
  },
  {
    id: 3,
    name: "Mohamed Youssef",
    email: "mohamed@restaurant.com",
    phone: "+20 102 345 6789",
    role: "Cashier",
    department: "Finance",
    status: "on-leave",
    joinDate: "2024-03-01",
    salary: 4500,
  },
  {
    id: 4,
    name: "Fatma Omar",
    email: "fatma@restaurant.com",
    phone: "+20 103 456 7890",
    role: "Waiter",
    department: "Service",
    status: "active",
    joinDate: "2024-02-10",
    salary: 5000,
  },
  {
    id: 5,
    name: "Khaled Mahmoud",
    email: "khaled@restaurant.com",
    phone: "+20 104 567 8901",
    role: "Chef",
    department: "Kitchen",
    status: "inactive",
    joinDate: "2023-06-05",
    salary: 7500,
  },
  {
    id: 6,
    name: "Nour Ibrahim",
    email: "nour@restaurant.com",
    phone: "+20 105 678 9012",
    role: "Host",
    department: "Service",
    status: "active",
    joinDate: "2024-04-18",
    salary: 4000,
  },
  {
    id: 7,
    name: "Omar Adel",
    email: "omar@restaurant.com",
    phone: "+20 106 789 0123",
    role: "Delivery",
    department: "Logistics",
    status: "active",
    joinDate: "2024-05-22",
    salary: 3500,
  },
  {
    id: 8,
    name: "Yara Mostafa",
    email: "yara@restaurant.com",
    phone: "+20 107 890 1234",
    role: "Manager",
    department: "Management",
    status: "active",
    joinDate: "2022-09-10",
    salary: 12000,
  },
];



const formatMinutes = (mins) => {
  if (!mins || mins <= 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};



export default function useStaffProfile(staffId) {
  const id = Number(staffId);

  const [activeTab, setActiveTab] = useState("overview");
  const [attendancePeriod, setAttendancePeriod] = useState("month");
  const [attendanceDate, setAttendanceDate] = useState(dayjs());
  const [settlementMonth, setSettlementMonth] = useState(dayjs());

  const staff = useMemo(() => staffList.find((s) => s.id === id) || null, [id]);
  const rawAttendance = useMemo(() => getAttendance(id), [id]);

  const todayRecord = useMemo(() => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    return rawAttendance.find((r) => r.date === todayStr) || null;
  }, [rawAttendance]);

  const filteredAttendance = useMemo(() => {
    return rawAttendance.filter((r) => {
      const d = dayjs(r.date);
      if (attendancePeriod === "day") return d.isSame(attendanceDate, "day");
      if (attendancePeriod === "week") return d.isSame(attendanceDate, "week");
      return d.isSame(attendanceDate, "month");
    });
  }, [rawAttendance, attendancePeriod, attendanceDate]);

  const attendanceSummary = useMemo(() => {
    const working = filteredAttendance.filter((r) => r.status !== "off");
    const present = working.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const late = working.filter((r) => r.status === "late").length;
    const absent = working.filter((r) => r.status === "absent").length;
    const onLeave = working.filter((r) => r.status === "on-leave").length;
    const totalWorkedMins = working.reduce(
      (a, r) => a + (r.workedMinutes || 0),
      0
    );
    const totalLateMins = working.reduce((a, r) => a + (r.lateMinutes || 0), 0);
    const totalOvertimeMins = working.reduce(
      (a, r) => a + (r.overtimeMinutes || 0),
      0
    );

    return {
      present,
      late,
      absent,
      onLeave,
      totalWorkedMins,
      totalWorkedFormatted: formatMinutes(totalWorkedMins),
      totalLateMins,
      totalLateFormatted: formatMinutes(totalLateMins),
      totalOvertimeMins,
      totalOvertimeFormatted: formatMinutes(totalOvertimeMins),
      workingDays: working.length,
    };
  }, [filteredAttendance]);

  const overviewStats = useMemo(() => {
    const now = dayjs();
    const todayMins = todayRecord?.workedMinutes || 0;

    const weekRecords = rawAttendance.filter((r) =>
      dayjs(r.date).isSame(now, "week")
    );
    const weekMins = weekRecords.reduce(
      (a, r) => a + (r.workedMinutes || 0),
      0
    );

    const monthRecords = rawAttendance.filter((r) =>
      dayjs(r.date).isSame(now, "month")
    );
    const monthMins = monthRecords.reduce(
      (a, r) => a + (r.workedMinutes || 0),
      0
    );
    const absentDays = monthRecords.filter((r) => r.status === "absent").length;
    const onLeaveDays = monthRecords.filter(
      (r) => r.status === "on-leave"
    ).length;

    return {
      todayHours: formatMinutes(todayMins),
      weekHours: formatMinutes(weekMins),
      monthHours: formatMinutes(monthMins),
      absentDays,
      onLeaveDays,
    };
  }, [rawAttendance, todayRecord]);

  const leaves = useMemo(() => allLeaves.filter((l) => l.staffId === id), [id]);
  const transfers = useMemo(
    () => allTransfers.filter((t) => t.staffId === id),
    [id]
  );
  const schedules = useMemo(
    () => allSchedules.filter((s) => s.staffId === id),
    [id]
  );

  const settlement = useMemo(() => {
    if (!staff) return null;

    const monthStr = settlementMonth.format("YYYY-MM");

    const monthAttendance = rawAttendance.filter(
      (r) => r.date.startsWith(monthStr) && r.status !== "off"
    );

    const workedMins = monthAttendance.reduce(
      (a, r) => a + (r.workedMinutes || 0),
      0
    );
    const absentMins = monthAttendance
      .filter((r) => r.status === "absent")
      .reduce((a) => a + 8 * 60, 0);

    const expectedMins = EXPECTED_MONTHLY_HOURS * 60;
    const absenceDeduction =
      absentMins > 0
        ? Math.round((staff.salary / expectedMins) * absentMins)
        : 0;

    const monthTransfers = transfers.filter((t) => t.month === monthStr);

    const advanceAmount = monthTransfers
      .filter((t) => t.type === "advance" && t.status === "completed")
      .reduce((a, t) => a + t.amount, 0);

    const deductionAmount = monthTransfers
      .filter((t) => t.type === "deduction" && t.status === "completed")
      .reduce((a, t) => a + t.amount, 0);

    const bonusAmount = monthTransfers
      .filter((t) => t.type === "bonus" && t.status === "completed")
      .reduce((a, t) => a + t.amount, 0);

    const reimbursementAmount = monthTransfers
      .filter((t) => t.type === "reimbursement" && t.status === "completed")
      .reduce((a, t) => a + t.amount, 0);

    const totalDeductions = absenceDeduction + advanceAmount + deductionAmount;
    const totalAdditions = bonusAmount + reimbursementAmount;
    const netAmount = staff.salary - totalDeductions + totalAdditions;

    const workedDays = monthAttendance.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const absentDays = monthAttendance.filter(
      (r) => r.status === "absent"
    ).length;

    return {
      baseSalary: staff.salary,
      workedHours: formatMinutes(workedMins),
      expectedHours: `${EXPECTED_MONTHLY_HOURS}h 0m`,
      workedDays,
      absentDays,
      absenceDeduction,
      advanceAmount,
      deductionAmount,
      bonusAmount,
      reimbursementAmount,
      totalDeductions,
      totalAdditions,
      netAmount,
    };
  }, [staff, rawAttendance, transfers, settlementMonth]);

  const handleTabChange = useCallback((key) => setActiveTab(key), []);
  const handleAttendancePeriodChange = useCallback(
    (p) => setAttendancePeriod(p),
    []
  );
  const handleAttendanceDateChange = useCallback(
    (d) => setAttendanceDate(d),
    []
  );
  const handleSettlementMonthChange = useCallback(
    (m) => setSettlementMonth(m),
    []
  );

  return {
    staff,
    activeTab,
    handleTabChange,

    attendancePeriod,
    attendanceDate,
    handleAttendancePeriodChange,
    handleAttendanceDateChange,
    filteredAttendance,
    attendanceSummary,
    todayRecord,
    overviewStats,

    leaves,
    transfers,
    schedules,

    settlementMonth,
    handleSettlementMonthChange,
    settlement,
  };
}
