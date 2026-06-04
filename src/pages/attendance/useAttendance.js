import { useState, useMemo, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getAllStaff } from "../../features/Staff/staffService";
import { getEmployeeLogs } from "../../features/Attendance/attendanceService";

const PAGE_SIZE = 10;
const SHIFTS = [
  { name: "Morning", start: "08:00", end: "16:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Evening", start: "18:00", end: "02:00" },
];
const DEPARTMENTS = ["Floor", "Kitchen", "Finance", "Logistics", "Management", "Bar", "Staff Food"];
const ROLES = ["Waiter", "Chef", "Cashier", "Host", "Delivery", "Manager", "Cleaner", "Barista", "Waitress"];

export default function useAttendance() {
  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(dayjs());

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

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff list on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await getAllStaff();
        if (response && response.status === "success" && response.data) {
          const list = response.data.map(item => ({
            id: item.employee_id,
            name: item.full_name,
            role: item.role || "Staff",
            department: item.department || "General",
          }));
          setStaffList(list);
          if (list.length > 0) {
            setSelectedStaffId(list[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load staff list", e);
      }
    };
    fetchStaff();
  }, []);

  // Selected staff details
  const selectedStaff = useMemo(() => {
    return staffList.find(s => String(s.id) === String(selectedStaffId)) || null;
  }, [staffList, selectedStaffId]);

  // Fetch employee logs
  const fetchLogs = useCallback(async () => {
    if (!selectedStaffId) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const response = await getEmployeeLogs(selectedStaffId, dateStr);
      if (response && response.status === "success" && response.data) {
        const s = selectedStaff || { name: "Staff", role: "Staff", department: "General" };
        const enriched = response.data.map(item => {
          const checkIn = item.check_in_time ? item.check_in_time.split(" ")[1].substring(0, 5) : null;
          const checkOut = item.check_out_time ? item.check_out_time.split(" ")[1].substring(0, 5) : null;
          
          let workedMinutes = 0;
          if (checkIn && checkOut) {
            const [inH, inM] = checkIn.split(":").map(Number);
            const [outH, outM] = checkOut.split(":").map(Number);
            workedMinutes = (outH * 60 + outM) - (inH * 60 + inM) - 30; // assume 30m break
            if (workedMinutes < 0) workedMinutes = 0;
          }
          
          const lateMinutes = parseInt(item.late_arrival_minutes || "0");
          let status = "absent";
          if (item.attendance_id) {
            status = lateMinutes > 0 ? "late" : "present";
          }

          return {
            id: item.shift_id,
            attendanceId: item.attendance_id,
            staffId: selectedStaffId,
            staffName: s.name,
            staffRole: s.role,
            department: s.department,
            date: item.shift_date,
            shiftName: item.shift_type,
            scheduledStart: item.start_time ? item.start_time.substring(0, 5) : null,
            scheduledEnd: item.end_time ? item.end_time.substring(0, 5) : null,
            checkIn: checkIn ? dayjs(checkIn, "HH:mm").format("h:mm a") : null,
            checkOut: checkOut ? dayjs(checkOut, "HH:mm").format("h:mm a") : null,
            workedMinutes,
            lateMinutes,
            status,
          };
        });
        setRecords(enriched);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error("Failed to load logs", e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStaffId, selectedDate, selectedStaff]);

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

  const hasActiveFilters = !!(searchText || department || role || statusFilter);

  const handleClearFilters = useCallback(() => {
    setSearchText("");
    setDepartment("");
    setRole("");
    setStatusFilter("");
    setPage(1);
  }, []);

  // Modals operations (Mock/Empty stub implementations)
  const handleOpenAdd = () => setAddModalOpen(true);
  const handleConfirmAdd = () => {
    toast.error("Manual add is not configured for backend.");
    setAddModalOpen(false);
  };
  
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditModalOpen(true);
  };
  const handleConfirmEdit = () => {
    toast.error("Manual edit is not configured for backend.");
    setEditModalOpen(false);
  };
  const handleDeleteRecord = () => {
    toast.error("Delete record is not configured for backend.");
  };

  return {
    records: pagedRecords,
    totalCount,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    stats,
    liveTime,
    staffList,
    shifts: SHIFTS,
    departments: DEPARTMENTS,
    roles: ROLES,
    loading,

    // Selected Employee State
    selectedStaffId,
    setSelectedStaffId,
    selectedStaff,
    todayRecordForSelected: null,
    workedLiveTime: null,
    handleClockIn: () => {},
    handleClockOut: () => {},

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
    refetch: fetchLogs,
  };
}
