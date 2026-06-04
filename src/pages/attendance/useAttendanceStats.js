import { useState, useEffect, useCallback, useDeferredValue } from "react";
import { getEmployeesAttendanceStats } from "../../features/Attendance/attendanceService";
import toast from "react-hot-toast";

export default function useAttendanceStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchRaw, setSearchRaw] = useState("");
  const [department, setDepartment] = useState("");

  const search = useDeferredValue(searchRaw);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmployeesAttendanceStats(page, pageSize, search, department);
      if (response && response.success) {
        setData(response.data || []);
        setTotalCount(response.totalCount || 0);
      } else {
        toast.error(response?.message || "Failed to load attendance statistics");
      }
    } catch (error) {
      toast.error(error.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset page when search or department changes
  useEffect(() => {
    setPage(1);
  }, [search, department]);

  return {
    data,
    loading,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchRaw,
    setSearchRaw,
    department,
    setDepartment,
    refetch: fetchStats,
  };
}
