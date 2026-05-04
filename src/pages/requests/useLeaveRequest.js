import { useState, useMemo, useCallback, useDeferredValue } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
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

const generateMockLeaves = () => {
  const today = dayjs();

  return [
    {
      id: 1,
      staffId: 1,
      staffName: "Ahmed Hassan",
      staffRole: "Waiter",
      type: "annual",
      startDate: today.add(3, "day").format("YYYY-MM-DD"),
      endDate: today.add(7, "day").format("YYYY-MM-DD"),
      days: 5,
      reason: "Family vacation trip",
      status: "pending",
      createdAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      id: 2,
      staffId: 2,
      staffName: "Sarah Mohamed",
      staffRole: "Chef",
      type: "sick",
      startDate: today.subtract(1, "day").format("YYYY-MM-DD"),
      endDate: today.add(1, "day").format("YYYY-MM-DD"),
      days: 3,
      reason: "Flu and fever",
      status: "approved",
      createdAt: today.subtract(2, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      reviewNote: "Get well soon",
    },
    {
      id: 3,
      staffId: 3,
      staffName: "Omar Ali",
      staffRole: "Cashier",
      type: "personal",
      startDate: today.add(5, "day").format("YYYY-MM-DD"),
      endDate: today.add(6, "day").format("YYYY-MM-DD"),
      days: 2,
      reason: "Personal errands",
      status: "pending",
      createdAt: today.format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      id: 4,
      staffId: 5,
      staffName: "Karim Saad",
      staffRole: "Delivery",
      type: "annual",
      startDate: today.subtract(10, "day").format("YYYY-MM-DD"),
      endDate: today.subtract(6, "day").format("YYYY-MM-DD"),
      days: 5,
      reason: "Travel abroad",
      status: "approved",
      createdAt: today.subtract(15, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(14, "day").format("YYYY-MM-DD"),
      reviewNote: "Approved",
    },
    {
      id: 5,
      staffId: 7,
      staffName: "Youssef Khalil",
      staffRole: "Chef",
      type: "unpaid",
      startDate: today.add(10, "day").format("YYYY-MM-DD"),
      endDate: today.add(14, "day").format("YYYY-MM-DD"),
      days: 5,
      reason: "Family emergency back home",
      status: "rejected",
      createdAt: today.subtract(3, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(2, "day").format("YYYY-MM-DD"),
      reviewNote: "Cannot approve during peak season",
    },
    {
      id: 6,
      staffId: 4,
      staffName: "Nour Ibrahim",
      staffRole: "Host",
      type: "sick",
      startDate: today.subtract(3, "day").format("YYYY-MM-DD"),
      endDate: today.subtract(2, "day").format("YYYY-MM-DD"),
      days: 2,
      reason: "Stomach issues",
      status: "approved",
      createdAt: today.subtract(4, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(3, "day").format("YYYY-MM-DD"),
      reviewNote: null,
    },
    {
      id: 7,
      staffId: 9,
      staffName: "Mostafa Adel",
      staffRole: "Waiter",
      type: "personal",
      startDate: today.add(1, "day").format("YYYY-MM-DD"),
      endDate: today.add(2, "day").format("YYYY-MM-DD"),
      days: 2,
      reason: "Moving to a new apartment",
      status: "pending",
      createdAt: today.format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      id: 8,
      staffId: 6,
      staffName: "Layla Mahmoud",
      staffRole: "Manager",
      type: "annual",
      startDate: today.add(20, "day").format("YYYY-MM-DD"),
      endDate: today.add(27, "day").format("YYYY-MM-DD"),
      days: 8,
      reason: "Summer vacation",
      status: "pending",
      createdAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
  ];
};

export default function useLeaveRequests() {
  const [leaves, setLeaves] = useState(generateMockLeaves);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // View
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLeave, setDeleteLeave] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Review
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLeave, setReviewLeave] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Filtered
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

  // Stats
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

  // Drawer handlers
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

        const staffMember = STAFF_MEMBERS.find((s) => s.id === values.staffId);
        const start = dayjs(values.dateRange[0]);
        const end = dayjs(values.dateRange[1]);
        const days = end.diff(start, "day") + 1;

        if (editLeave) {
          setLeaves((prev) =>
            prev.map((leave) =>
              leave.id === editLeave.id
                ? {
                    ...leave,
                    staffId: values.staffId,
                    staffName: staffMember?.name || leave.staffName,
                    staffRole: staffMember?.role || leave.staffRole,
                    type: values.type,
                    startDate: start.format("YYYY-MM-DD"),
                    endDate: end.format("YYYY-MM-DD"),
                    days,
                    reason: values.reason || "",
                  }
                : leave
            )
          );
          toast.success("Leave request updated");
        } else {
          const newLeave = {
            id: Date.now(),
            staffId: values.staffId,
            staffName: staffMember?.name || "",
            staffRole: staffMember?.role || "",
            type: values.type,
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
            days,
            reason: values.reason || "",
            status: "pending",
            createdAt: dayjs().format("YYYY-MM-DD"),
            reviewedBy: null,
            reviewedAt: null,
            reviewNote: null,
          };

          setLeaves((prev) => [newLeave, ...prev]);
          toast.success(`Leave request created for ${staffMember?.name}`);
        }

        handleCloseDrawer();
      } catch {
        toast.error("Failed to save leave request");
      } finally {
        setDrawerLoading(false);
      }
    },
    [editLeave, handleCloseDrawer]
  );

  // View
  const handleViewLeave = useCallback((leave) => {
    setViewLeave(leave);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewLeave(null);
  }, []);

  // Delete
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

  // Review (approve / reject)
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
        await new Promise((res) => setTimeout(res, 700));

        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === reviewLeave.id
              ? {
                  ...leave,
                  status: action,
                  reviewedBy: "Admin",
                  reviewedAt: dayjs().format("YYYY-MM-DD"),
                  reviewNote: note || null,
                }
              : leave
          )
        );

        const label = action === "approved" ? "approved" : "rejected";
        toast.success(`Leave request ${label}`);
        handleCloseReview();
      } catch {
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
    staffMembers: STAFF_MEMBERS,

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
