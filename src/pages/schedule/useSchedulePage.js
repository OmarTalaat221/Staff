import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const SHIFT_TYPES = [
  {
    key: "morning",
    label: "Morning",
    time: "06:00 - 14:00",
    startTime: "06:00",
    endTime: "14:00",
    color: "warning",
  },
  {
    key: "afternoon",
    label: "Afternoon",
    time: "14:00 - 22:00",
    startTime: "14:00",
    endTime: "22:00",
    color: "primary",
  },
  {
    key: "evening",
    label: "Evening",
    time: "22:00 - 06:00",
    startTime: "22:00",
    endTime: "06:00",
    color: "secondary",
  },
];

const STAFF_MEMBERS = [
  { id: 1, name: "Ahmed Hassan", role: "Waiter" },
  { id: 2, name: "Sarah Mohamed", role: "Chef" },
  { id: 3, name: "Omar Ali", role: "Cashier" },
  { id: 4, name: "Nour Ibrahim", role: "Host" },
  { id: 5, name: "Karim Saad", role: "Delivery" },
  { id: 6, name: "Layla Mahmoud", role: "Manager" },
  { id: 7, name: "Youssef Khalil", role: "Chef" },
  { id: 8, name: "Dina Samy", role: "Cleaner" },
  { id: 9, name: "Mostafa Adel", role: "Waiter" },
  { id: 10, name: "Rania Fawzy", role: "Cashier" },
];

const generateMockShifts = (weekStart) => {
  const shifts = [];
  let id = 1;
  const days = [];

  for (let i = 0; i < 7; i++) {
    days.push(weekStart.add(i, "day").format("YYYY-MM-DD"));
  }

  days.forEach((date) => {
    const morningStaff = STAFF_MEMBERS.slice(0, 4);
    const afternoonStaff = STAFF_MEMBERS.slice(3, 7);
    const eveningStaff = STAFF_MEMBERS.slice(6, 9);

    morningStaff.forEach((staff) => {
      shifts.push({
        id: id++,
        date,
        shiftType: "morning",
        staffId: staff.id,
        staffName: staff.name,
        staffRole: staff.role,
        startTime: "06:00",
        endTime: "14:00",
        breakMinutes: 30,
        notes: "",
      });
    });

    afternoonStaff.forEach((staff) => {
      shifts.push({
        id: id++,
        date,
        shiftType: "afternoon",
        staffId: staff.id,
        staffName: staff.name,
        staffRole: staff.role,
        startTime: "14:00",
        endTime: "22:00",
        breakMinutes: 30,
        notes: "",
      });
    });

    eveningStaff.forEach((staff) => {
      shifts.push({
        id: id++,
        date,
        shiftType: "evening",
        staffId: staff.id,
        staffName: staff.name,
        staffRole: staff.role,
        startTime: "22:00",
        endTime: "06:00",
        breakMinutes: 30,
        notes: "",
      });
    });
  });

  return shifts;
};

const BREAK_PRESETS = [
  { id: 1, label: "Short Break", minutes: 15, isActive: true },
  { id: 2, label: "Lunch Break", minutes: 30, isActive: true },
  { id: 3, label: "Long Break", minutes: 60, isActive: true },
];

export default function useSchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("isoWeek")
  );
  const [shifts, setShifts] = useState(() =>
    generateMockShifts(dayjs().startOf("isoWeek"))
  );
  const [shiftTypeFilter, setShiftTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState(null);
  const [preSelectedShiftType, setPreSelectedShiftType] = useState(null);

  // View
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewShift, setViewShift] = useState(null);

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteShift, setDeleteShift] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Break
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakPresets, setBreakPresets] = useState(BREAK_PRESETS);

  // Week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = currentWeekStart.add(i, "day");
      days.push({
        date: day.format("YYYY-MM-DD"),
        dayName: day.format("ddd"),
        dayNumber: day.format("D"),
        monthName: day.format("MMM"),
        isToday: day.isSame(dayjs(), "day"),
        fullDate: day,
      });
    }
    return days;
  }, [currentWeekStart]);

  const weekLabel = useMemo(() => {
    const end = currentWeekStart.add(6, "day");
    if (currentWeekStart.month() === end.month()) {
      return `${currentWeekStart.format("MMM D")} - ${end.format("D, YYYY")}`;
    }
    return `${currentWeekStart.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
  }, [currentWeekStart]);

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const inWeek = weekDays.some((d) => d.date === s.date);
      const matchType = !shiftTypeFilter || s.shiftType === shiftTypeFilter;
      const matchRole = !roleFilter || s.staffRole === roleFilter;
      return inWeek && matchType && matchRole;
    });
  }, [shifts, weekDays, shiftTypeFilter, roleFilter]);

  // Group shifts by date and shift type
  const groupedShifts = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => {
      grouped[day.date] = {
        morning: [],
        afternoon: [],
        evening: [],
      };
    });
    filteredShifts.forEach((shift) => {
      if (grouped[shift.date] && grouped[shift.date][shift.shiftType]) {
        grouped[shift.date][shift.shiftType].push(shift);
      }
    });
    return grouped;
  }, [filteredShifts, weekDays]);

  // Stats
  const stats = useMemo(() => {
    const weekShifts = shifts.filter((s) =>
      weekDays.some((d) => d.date === s.date)
    );
    const totalShifts = weekShifts.length;
    const uniqueStaff = new Set(weekShifts.map((s) => s.staffId)).size;
    const totalHours = weekShifts.reduce((acc, s) => {
      const start = dayjs(`2000-01-01 ${s.startTime}`);
      let end = dayjs(`2000-01-01 ${s.endTime}`);
      if (end.isBefore(start)) end = end.add(1, "day");
      const hours = end.diff(start, "hour");
      return acc + hours - (s.breakMinutes || 0) / 60;
    }, 0);
    const todayShifts = weekShifts.filter(
      (s) => s.date === dayjs().format("YYYY-MM-DD")
    ).length;

    return {
      totalShifts,
      uniqueStaff,
      totalHours: Math.round(totalHours),
      todayShifts,
    };
  }, [shifts, weekDays]);

  const hasActiveFilters = !!(shiftTypeFilter || roleFilter);

  // Navigation
  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newStart = prev.subtract(7, "day");
      setShifts(generateMockShifts(newStart));
      return newStart;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newStart = prev.add(7, "day");
      setShifts(generateMockShifts(newStart));
      return newStart;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = dayjs().startOf("isoWeek");
    setCurrentWeekStart(today);
    setShifts(generateMockShifts(today));
  }, []);

  const handleClearFilters = useCallback(() => {
    setShiftTypeFilter("");
    setRoleFilter("");
    toast("Filters cleared", { icon: "✓" });
  }, []);

  // CRUD
  const handleOpenAdd = useCallback((date, shiftType) => {
    setEditShift(null);
    setPreSelectedDate(date || null);
    setPreSelectedShiftType(shiftType || null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((shift) => {
    setEditShift(shift);
    setPreSelectedDate(null);
    setPreSelectedShiftType(null);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditShift(null);
    setPreSelectedDate(null);
    setPreSelectedShiftType(null);
  }, []);

  const handleSubmitShift = useCallback(
    async (values) => {
      setDrawerLoading(true);
      try {
        await new Promise((res) => setTimeout(res, 800));

        const staffMember = STAFF_MEMBERS.find((s) => s.id === values.staffId);
        const shiftConfig = SHIFT_TYPES.find((t) => t.key === values.shiftType);

        if (editShift) {
          setShifts((prev) =>
            prev.map((s) =>
              s.id === editShift.id
                ? {
                    ...s,
                    ...values,
                    staffName: staffMember?.name || s.staffName,
                    staffRole: staffMember?.role || s.staffRole,
                    startTime: values.startTime || shiftConfig?.startTime,
                    endTime: values.endTime || shiftConfig?.endTime,
                  }
                : s
            )
          );
          toast.success(`Shift updated for ${staffMember?.name || "staff"}`);
        } else {
          const newShift = {
            id: Date.now(),
            date: values.date,
            shiftType: values.shiftType,
            staffId: values.staffId,
            staffName: staffMember?.name || "",
            staffRole: staffMember?.role || "",
            startTime: values.startTime || shiftConfig?.startTime,
            endTime: values.endTime || shiftConfig?.endTime,
            breakMinutes: values.breakMinutes || 30,
            notes: values.notes || "",
          };
          setShifts((prev) => [...prev, newShift]);
          toast.success(`Shift assigned to ${staffMember?.name || "staff"}`);
        }
        handleCloseDrawer();
      } catch {
        toast.error("Failed to save shift");
      } finally {
        setDrawerLoading(false);
      }
    },
    [editShift, handleCloseDrawer]
  );

  const handleViewShift = useCallback((shift) => {
    setViewShift(shift);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewShift(null);
  }, []);

  const handleOpenDelete = useCallback((shift) => {
    setDeleteShift(shift);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteShift(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 700));
      const name = deleteShift.staffName;
      setShifts((prev) => prev.filter((s) => s.id !== deleteShift.id));
      toast.success(`${name}'s shift has been removed`);
      handleCloseDelete();
    } catch {
      toast.error("Failed to delete shift");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteShift, handleCloseDelete]);

  // Break Time
  const handleOpenBreakSettings = useCallback(() => {
    setBreakModalOpen(true);
  }, []);

  const handleCloseBreakSettings = useCallback(() => {
    setBreakModalOpen(false);
  }, []);

  const handleSaveBreakPresets = useCallback(async (presets) => {
    try {
      await new Promise((res) => setTimeout(res, 500));
      setBreakPresets(presets);
      toast.success("Break time settings saved");
      setBreakModalOpen(false);
    } catch {
      toast.error("Failed to save break settings");
    }
  }, []);

  return {
    // Week
    currentWeekStart,
    weekDays,
    weekLabel,
    goToPrevWeek,
    goToNextWeek,
    goToToday,

    // Data
    shifts: filteredShifts,
    groupedShifts,
    stats,
    shiftTypes: SHIFT_TYPES,
    staffMembers: STAFF_MEMBERS,

    // Filters
    shiftTypeFilter,
    setShiftTypeFilter,
    roleFilter,
    setRoleFilter,
    hasActiveFilters,
    handleClearFilters,

    // Drawer
    drawerOpen,
    editShift,
    drawerLoading,
    preSelectedDate,
    preSelectedShiftType,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitShift,

    // View
    viewModalOpen,
    viewShift,
    handleViewShift,
    handleCloseView,

    // Delete
    deleteModalOpen,
    deleteShift,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    // Break
    breakModalOpen,
    breakPresets,
    handleOpenBreakSettings,
    handleCloseBreakSettings,
    handleSaveBreakPresets,
  };
}
