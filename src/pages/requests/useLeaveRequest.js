import { useState, useMemo, useCallback, useDeferredValue, useEffect } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getLeaves, updateLeaveStatus } from "../../features/Leaves/leavesService";
import { getAllStaff } from "../../features/Staff/staffService";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

export default function useLeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);


  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);


  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLeave, setDeleteLeave] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLeave, setReviewLeave] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);


  const apiToUi = useCallback((api) => {
    const start = dayjs(api.start_date);
    const end = dayjs(api.end_date);
    const calculatedDays = start.isValid() && end.isValid() ? end.diff(start, "day") + 1 : 0;

    return {
      id: String(api.leave_id),
      leave_id: api.leave_id,
      staffId: Number(api.employee_id),
      staffName: api.full_name || "Name",
      staffRole: api.role || "Waiter",
      department: api.department || "Service",
      type: "personal",
      startDate: api.start_date,
      endDate: api.end_date,
      days: calculatedDays,
      reason: api.reason || "",
      handover: api.handover || "",
      status: api.status ? api.status.toLowerCase() : "pending",
      reviewNote: api.admin_notes || "",
      createdAt: api.created_at,
      reviewedBy: "Admin",
      reviewedAt: api.updated_at || api.created_at,
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, staffRes] = await Promise.all([
        getLeaves(),
        getAllStaff()
      ]);

      if (leavesRes.status === "success") {
        setLeaves(leavesRes.data.map(apiToUi));
      } else {
        toast.error("Failed to load leaves requests");
      }

      if (staffRes.status === "success") {
        setStaffMembers(
          staffRes.data.map((s) => ({
            id: Number(s.employee_id),
            name: s.full_name,
            role: s.role,
          }))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leaves requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiToUi]);


  const filteredLeaves = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();

    return leaves.filter((leave) => {
      const matchSearch =
        !searchLower ||
        leave.staffName.toLowerCase().includes(searchLower) ||
        leave.staffRole.toLowerCase().includes(searchLower) ||
        leave.reason.toLowerCase().includes(searchLower);

      const matchType = !filterType || leave.type === filterType;
      const matchStatus = !filterStatus || leave.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [leaves, deferredSearch, filterType, filterStatus]);


  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    const totalDays = leaves
      .filter((l) => l.status === "approved")
      .reduce((acc, l) => acc + l.days, 0);

    return { total, pending, approved, rejected, totalDays };
  }, [leaves]);

  const hasActiveFilters = !!(deferredSearch || filterType || filterStatus);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
    toast("Filters cleared", { icon: "✓" });
  }, []);


  const handleOpenAdd = useCallback(() => {
    setEditLeave(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((leave) => {
    setEditLeave(leave);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditLeave(null);
  }, []);

  const handleSubmitLeave = useCallback(
    async (values) => {
      setDrawerLoading(true);
      try {

        await new Promise((res) => setTimeout(res, 800));
        toast.success("Feature normally initiated from Employee App");
        handleCloseDrawer();
      } catch {
        toast.error("Failed to save leave request");
      } finally {
        setDrawerLoading(false);
      }
    },
    [handleCloseDrawer]
  );


  const handleViewLeave = useCallback((leave) => {
    setViewLeave(leave);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewLeave(null);
  }, []);


  const handleOpenDelete = useCallback((leave) => {
    setDeleteLeave(leave);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteLeave(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 700));
      const name = deleteLeave.staffName;
      setLeaves((prev) => prev.filter((l) => l.id !== deleteLeave.id));
      toast.success(`${name}'s leave request has been removed`);
      handleCloseDelete();
    } catch {
      toast.error("Failed to delete leave request");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLeave, handleCloseDelete]);


  const handleOpenReview = useCallback((leave) => {
    setReviewLeave(leave);
    setReviewModalOpen(true);
  }, []);

  const handleCloseReview = useCallback(() => {
    setReviewModalOpen(false);
    setReviewLeave(null);
  }, []);

  const handleReviewAction = useCallback(
    async (action, note) => {
      setReviewLoading(true);

      try {
        const apiStatus = action === "approved" ? "Approved" : "Rejected";
        const res = await updateLeaveStatus(reviewLeave.id, apiStatus, note || "");

        if (res.status === "success") {
          toast.success(`Leave request ${action} successfully`);
          fetchData();
          handleCloseReview();
        } else {
          toast.error(res.message || "Failed to update leave status");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to review leave request");
      } finally {
        setReviewLoading(false);
      }
    },
    [reviewLeave, handleCloseReview]
  );

  return {
    leaves: filteredLeaves,
    stats,
    leaveTypes: LEAVE_TYPES,
    staffMembers,
    loading,

    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    hasActiveFilters,
    handleClearFilters,

    drawerOpen,
    editLeave,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitLeave,

    viewModalOpen,
    viewLeave,
    handleViewLeave,
    handleCloseView,

    deleteModalOpen,
    deleteLeave,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    reviewModalOpen,
    reviewLeave,
    reviewLoading,
    handleOpenReview,
    handleCloseReview,
    handleReviewAction,
  };
}
