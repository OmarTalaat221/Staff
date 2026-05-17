import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { getAllShifts, addShift, updateShift, deleteShift } from "../../features/Schedule/scheduleService";
import { getAllStaff } from "../../features/Staff/staffService";

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
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [shiftTypeFilter, setShiftTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        getAllShifts(),
        getAllStaff()
      ]);

      if (shiftsRes.status === "success") {
        setShifts(shiftsRes.data.map(item => ({
          id: item.shift_id,
          date: item.shift_date,
          shiftType: item.shift_type.toLowerCase(),
          staffId: item.employee_id,
          staffName: item.full_name,
          staffRole: item.role,
          startTime: item.start_time,
          endTime: item.end_time,
          breakStart: item.break_start,
          breakEnd: item.break_end,

          breakMinutes: item.break_start && item.break_end
            ? dayjs(`2000-01-01 ${item.break_end}`).diff(dayjs(`2000-01-01 ${item.break_start}`), 'minute')
            : 0,
          notes: item.notes,
        })));
      }

      if (staffRes.status === "success") {
        setStaffMembers(staffRes.data.map(item => ({
          id: item.employee_id,
          name: item.full_name,
          role: item.role
        })));
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState(null);
  const [preSelectedShiftType, setPreSelectedShiftType] = useState(null);


  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewShift, setViewShift] = useState(null);


  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteShift, setDeleteShift] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakPresets, setBreakPresets] = useState(BREAK_PRESETS);


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


  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const inWeek = weekDays.some((d) => d.date === s.date);
      const matchType = !shiftTypeFilter || s.shiftType === shiftTypeFilter;
      const matchRole = !roleFilter || s.staffRole === roleFilter;
      return inWeek && matchType && matchRole;
    });
  }, [shifts, weekDays, shiftTypeFilter, roleFilter]);


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


  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev.subtract(7, "day"));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev.add(7, "day"));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(dayjs().startOf("isoWeek"));
  }, []);

  const handleClearFilters = useCallback(() => {
    setShiftTypeFilter("");
    setRoleFilter("");
    toast("Filters cleared", { icon: "✓" });
  }, []);


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
        const staffMember = staffMembers.find((s) => s.id === values.staffId);
        const shiftConfig = SHIFT_TYPES.find((t) => t.key === values.shiftType);


        const payload = {
          employee_id: values.staffId,
          shift_date: values.date,
          shift_type: values.shiftType.charAt(0).toUpperCase() + values.shiftType.slice(1),
          start_time: values.startTime || shiftConfig?.startTime,
          end_time: values.endTime || shiftConfig?.endTime,
          break_start: values.breakStart || "12:00",
          break_end: values.breakEnd || "13:00",
          notes: values.notes || "",
        };

        if (editShift) {
          payload.shift_id = editShift.id;
          const response = await updateShift(payload);
          if (response.status === "success") {
            toast.success(`Shift updated for ${staffMember?.name || "staff"}`);
            fetchData();
            handleCloseDrawer();
          } else {
            toast.error(response.message || "Failed to update shift");
          }
        } else {
          const response = await addShift(payload);
          if (response.status === "success") {
            toast.success(`Shift assigned to ${staffMember?.name || "staff"}`);
            fetchData();
            handleCloseDrawer();
          } else {
            toast.error(response.message || "Failed to add shift");
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to save shift");
      } finally {
        setDrawerLoading(false);
      }
    },
    [editShift, handleCloseDrawer, staffMembers]
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
      const response = await deleteShift(deleteShift.id);
      if (response.status === "success") {
        const name = deleteShift.staffName;
        toast.success(`${name}'s shift has been removed`);
        fetchData();
        handleCloseDelete();
      } else {
        toast.error(response.message || "Failed to delete shift");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete shift");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteShift, handleCloseDelete]);


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

    currentWeekStart,
    weekDays,
    weekLabel,
    goToPrevWeek,
    goToNextWeek,
    goToToday,


    shifts: filteredShifts,
    groupedShifts,
    stats,
    loading,
    shiftTypes: SHIFT_TYPES,
    staffMembers,


    shiftTypeFilter,
    setShiftTypeFilter,
    roleFilter,
    setRoleFilter,
    hasActiveFilters,
    handleClearFilters,


    drawerOpen,
    editShift,
    drawerLoading,
    preSelectedDate,
    preSelectedShiftType,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitShift,


    viewModalOpen,
    viewShift,
    handleViewShift,
    handleCloseView,


    deleteModalOpen,
    deleteShift,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,


    breakModalOpen,
    breakPresets,
    handleOpenBreakSettings,
    handleCloseBreakSettings,
    handleSaveBreakPresets,
  };
}
