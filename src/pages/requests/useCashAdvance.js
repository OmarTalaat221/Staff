import { useState, useMemo, useCallback, useDeferredValue } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const REPAYMENT_METHODS = [
  { value: "salary-deduction", label: "Salary Deduction" },
  { value: "installments", label: "Monthly Installments" },
  { value: "one-time", label: "One-Time Payment" },
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

const generateMockAdvances = () => {
  const today = dayjs();

  return [
    {
      id: 1,
      staffId: 1,
      staffName: "Ahmed Hassan",
      staffRole: "Waiter",
      amount: 2000,
      reason: "Medical emergency",
      status: "pending",
      repaymentMethod: "salary-deduction",
      requestedAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      paidAt: null,
    },
    {
      id: 2,
      staffId: 2,
      staffName: "Sarah Mohamed",
      staffRole: "Chef",
      amount: 5000,
      reason: "House rent deposit",
      status: "approved",
      repaymentMethod: "installments",
      requestedAt: today.subtract(5, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(4, "day").format("YYYY-MM-DD"),
      reviewNote: "Approved, deduct over 3 months",
      paidAt: null,
    },
    {
      id: 3,
      staffId: 3,
      staffName: "Omar Ali",
      staffRole: "Cashier",
      amount: 1500,
      reason: "Car repair",
      status: "paid",
      repaymentMethod: "salary-deduction",
      requestedAt: today.subtract(15, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(14, "day").format("YYYY-MM-DD"),
      reviewNote: null,
      paidAt: today.subtract(12, "day").format("YYYY-MM-DD"),
    },
    {
      id: 4,
      staffId: 5,
      staffName: "Karim Saad",
      staffRole: "Delivery",
      amount: 3000,
      reason: "Wedding expenses",
      status: "rejected",
      repaymentMethod: "one-time",
      requestedAt: today.subtract(7, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(6, "day").format("YYYY-MM-DD"),
      reviewNote: "Exceeds limit for this month",
      paidAt: null,
    },
    {
      id: 5,
      staffId: 7,
      staffName: "Youssef Khalil",
      staffRole: "Chef",
      amount: 1000,
      reason: "Personal needs",
      status: "pending",
      repaymentMethod: "salary-deduction",
      requestedAt: today.format("YYYY-MM-DD"),
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      paidAt: null,
    },
    {
      id: 6,
      staffId: 9,
      staffName: "Mostafa Adel",
      staffRole: "Waiter",
      amount: 2500,
      reason: "Family emergency",
      status: "approved",
      repaymentMethod: "installments",
      requestedAt: today.subtract(3, "day").format("YYYY-MM-DD"),
      reviewedBy: "Admin",
      reviewedAt: today.subtract(2, "day").format("YYYY-MM-DD"),
      reviewNote: "Approved",
      paidAt: null,
    },
  ];
};

export default function useCashAdvance() {
  const [advances, setAdvances] = useState(generateMockAdvances);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editAdvance, setEditAdvance] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // View
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAdvance, setViewAdvance] = useState(null);

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAdvance, setDeleteAdvance] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Review
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAdvance, setReviewAdvance] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Filtered
  const filteredAdvances = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();

    return advances.filter((adv) => {
      const matchSearch =
        !searchLower ||
        adv.staffName.toLowerCase().includes(searchLower) ||
        adv.staffRole.toLowerCase().includes(searchLower) ||
        adv.reason.toLowerCase().includes(searchLower);

      const matchStatus = !filterStatus || adv.status === filterStatus;
      const matchMethod = !filterMethod || adv.repaymentMethod === filterMethod;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [advances, deferredSearch, filterStatus, filterMethod]);

  // Stats
  const stats = useMemo(() => {
    const total = advances.length;
    const pending = advances.filter((a) => a.status === "pending").length;
    const approved = advances.filter((a) => a.status === "approved").length;
    const paid = advances.filter((a) => a.status === "paid").length;
    const totalAmount = advances.reduce((acc, a) => acc + a.amount, 0);
    const approvedAmount = advances
      .filter((a) => a.status === "approved" || a.status === "paid")
      .reduce((acc, a) => acc + a.amount, 0);

    return { total, pending, approved, paid, totalAmount, approvedAmount };
  }, [advances]);

  const hasActiveFilters = !!(deferredSearch || filterStatus || filterMethod);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus("");
    setFilterMethod("");
    toast("Filters cleared", { icon: "✓" });
  }, []);

  // Drawer
  const handleOpenAdd = useCallback(() => {
    setEditAdvance(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((advance) => {
    setEditAdvance(advance);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditAdvance(null);
  }, []);

  const handleSubmitAdvance = useCallback(
    async (values) => {
      setDrawerLoading(true);

      try {
        await new Promise((res) => setTimeout(res, 800));

        const staffMember = STAFF_MEMBERS.find((s) => s.id === values.staffId);

        if (editAdvance) {
          setAdvances((prev) =>
            prev.map((adv) =>
              adv.id === editAdvance.id
                ? {
                    ...adv,
                    staffId: values.staffId,
                    staffName: staffMember?.name || adv.staffName,
                    staffRole: staffMember?.role || adv.staffRole,
                    amount: values.amount,
                    reason: values.reason || "",
                    repaymentMethod: values.repaymentMethod,
                  }
                : adv
            )
          );
          toast.success("Advance request updated");
        } else {
          const newAdvance = {
            id: Date.now(),
            staffId: values.staffId,
            staffName: staffMember?.name || "",
            staffRole: staffMember?.role || "",
            amount: values.amount,
            reason: values.reason || "",
            status: "pending",
            repaymentMethod: values.repaymentMethod,
            requestedAt: dayjs().format("YYYY-MM-DD"),
            reviewedBy: null,
            reviewedAt: null,
            reviewNote: null,
            paidAt: null,
          };

          setAdvances((prev) => [newAdvance, ...prev]);
          toast.success(`Advance request created for ${staffMember?.name}`);
        }

        handleCloseDrawer();
      } catch {
        toast.error("Failed to save advance request");
      } finally {
        setDrawerLoading(false);
      }
    },
    [editAdvance, handleCloseDrawer]
  );

  // View
  const handleViewAdvance = useCallback((advance) => {
    setViewAdvance(advance);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewAdvance(null);
  }, []);

  // Delete
  const handleOpenDelete = useCallback((advance) => {
    setDeleteAdvance(advance);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteAdvance(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 700));
      const name = deleteAdvance.staffName;
      setAdvances((prev) => prev.filter((a) => a.id !== deleteAdvance.id));
      toast.success(`${name}'s advance request has been removed`);
      handleCloseDelete();
    } catch {
      toast.error("Failed to delete advance request");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteAdvance, handleCloseDelete]);

  // Review
  const handleOpenReview = useCallback((advance) => {
    setReviewAdvance(advance);
    setReviewModalOpen(true);
  }, []);

  const handleCloseReview = useCallback(() => {
    setReviewModalOpen(false);
    setReviewAdvance(null);
  }, []);

  const handleReviewAction = useCallback(
    async (action, note) => {
      setReviewLoading(true);

      try {
        await new Promise((res) => setTimeout(res, 700));

        setAdvances((prev) =>
          prev.map((adv) =>
            adv.id === reviewAdvance.id
              ? {
                  ...adv,
                  status: action,
                  reviewedBy: "Admin",
                  reviewedAt: dayjs().format("YYYY-MM-DD"),
                  reviewNote: note || null,
                }
              : adv
          )
        );

        const label = action === "approved" ? "approved" : "rejected";
        toast.success(`Advance request ${label}`);
        handleCloseReview();
      } catch {
        toast.error("Failed to review advance request");
      } finally {
        setReviewLoading(false);
      }
    },
    [reviewAdvance, handleCloseReview]
  );

  // Mark as paid
  const handleMarkPaid = useCallback(async (advance) => {
    try {
      await new Promise((res) => setTimeout(res, 500));

      setAdvances((prev) =>
        prev.map((adv) =>
          adv.id === advance.id
            ? {
                ...adv,
                status: "paid",
                paidAt: dayjs().format("YYYY-MM-DD"),
              }
            : adv
        )
      );

      toast.success(`Advance marked as paid for ${advance.staffName}`);
    } catch {
      toast.error("Failed to update status");
    }
  }, []);

  return {
    advances: filteredAdvances,
    stats,
    repaymentMethods: REPAYMENT_METHODS,
    staffMembers: STAFF_MEMBERS,

    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterMethod,
    setFilterMethod,
    hasActiveFilters,
    handleClearFilters,

    drawerOpen,
    editAdvance,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitAdvance,

    viewModalOpen,
    viewAdvance,
    handleViewAdvance,
    handleCloseView,

    deleteModalOpen,
    deleteAdvance,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    reviewModalOpen,
    reviewAdvance,
    reviewLoading,
    handleOpenReview,
    handleCloseReview,
    handleReviewAction,

    handleMarkPaid,
  };
}
