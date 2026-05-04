import {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const TRANSFER_TYPES = [
  { value: "salary", label: "Salary" },
  { value: "bonus", label: "Bonus" },
  { value: "advance", label: "Cash Advance" },
  { value: "deduction", label: "Deduction" },
  { value: "reimbursement", label: "Reimbursement" },
];

const PAYMENT_METHODS = [
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "E-Wallet" },
];

const STAFF_MEMBERS = [
  { id: 1, name: "Ahmed Hassan", role: "Waiter", salary: 6000 },
  { id: 2, name: "Sarah Mohamed", role: "Chef", salary: 9000 },
  { id: 3, name: "Omar Ali", role: "Cashier", salary: 5500 },
  { id: 4, name: "Nour Ibrahim", role: "Host", salary: 5000 },
  { id: 5, name: "Karim Saad", role: "Delivery", salary: 4500 },
  { id: 6, name: "Layla Mahmoud", role: "Manager", salary: 12000 },
  { id: 7, name: "Youssef Khalil", role: "Chef", salary: 8500 },
  { id: 8, name: "Dina Samy", role: "Cleaner", salary: 3500 },
  { id: 9, name: "Mostafa Adel", role: "Waiter", salary: 5500 },
  { id: 10, name: "Rania Fawzy", role: "Cashier", salary: 5000 },
];

const generateRef = () =>
  `TXN-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const generateMockTransfers = () => {
  const today = dayjs();
  const currentMonth = today.format("YYYY-MM");
  const lastMonth = today.subtract(1, "month").format("YYYY-MM");

  return [
    {
      id: 1,
      staffId: 1,
      staffName: "Ahmed Hassan",
      staffRole: "Waiter",
      type: "salary",
      amount: 6000,
      method: "bank-transfer",
      reference: "TXN-A1B2C3",
      month: lastMonth,
      status: "completed",
      note: "",
      createdAt: today.subtract(5, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(4, "day").format("YYYY-MM-DD"),
    },
    {
      id: 2,
      staffId: 2,
      staffName: "Sarah Mohamed",
      staffRole: "Chef",
      type: "salary",
      amount: 9000,
      method: "bank-transfer",
      reference: "TXN-D4E5F6",
      month: lastMonth,
      status: "completed",
      note: "",
      createdAt: today.subtract(5, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(4, "day").format("YYYY-MM-DD"),
    },
    {
      id: 3,
      staffId: 1,
      staffName: "Ahmed Hassan",
      staffRole: "Waiter",
      type: "bonus",
      amount: 500,
      method: "cash",
      reference: "TXN-G7H8I9",
      month: lastMonth,
      status: "completed",
      note: "Performance bonus",
      createdAt: today.subtract(3, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(3, "day").format("YYYY-MM-DD"),
    },
    {
      id: 4,
      staffId: 3,
      staffName: "Omar Ali",
      staffRole: "Cashier",
      type: "salary",
      amount: 5500,
      method: "bank-transfer",
      reference: "TXN-J1K2L3",
      month: currentMonth,
      status: "processing",
      note: "",
      createdAt: today.format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 5,
      staffId: 5,
      staffName: "Karim Saad",
      staffRole: "Delivery",
      type: "deduction",
      amount: 200,
      method: "bank-transfer",
      reference: "TXN-M4N5O6",
      month: currentMonth,
      status: "completed",
      note: "Late deduction - 2 days",
      createdAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(1, "day").format("YYYY-MM-DD"),
    },
    {
      id: 6,
      staffId: 6,
      staffName: "Layla Mahmoud",
      staffRole: "Manager",
      type: "salary",
      amount: 12000,
      method: "bank-transfer",
      reference: "TXN-P7Q8R9",
      month: currentMonth,
      status: "pending",
      note: "",
      createdAt: today.format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 7,
      staffId: 7,
      staffName: "Youssef Khalil",
      staffRole: "Chef",
      type: "reimbursement",
      amount: 350,
      method: "wallet",
      reference: "TXN-S1T2U3",
      month: currentMonth,
      status: "completed",
      note: "Uniform reimbursement",
      createdAt: today.subtract(2, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(1, "day").format("YYYY-MM-DD"),
    },
    {
      id: 8,
      staffId: 4,
      staffName: "Nour Ibrahim",
      staffRole: "Host",
      type: "salary",
      amount: 5000,
      method: "bank-transfer",
      reference: "TXN-V4W5X6",
      month: currentMonth,
      status: "failed",
      note: "Bank account issue",
      createdAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 9,
      staffId: 9,
      staffName: "Mostafa Adel",
      staffRole: "Waiter",
      type: "salary",
      amount: 5500,
      method: "bank-transfer",
      reference: "TXN-Y7Z8A1",
      month: currentMonth,
      status: "pending",
      note: "",
      createdAt: today.format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 10,
      staffId: 2,
      staffName: "Sarah Mohamed",
      staffRole: "Chef",
      type: "bonus",
      amount: 1000,
      method: "cash",
      reference: "TXN-B2C3D4",
      month: currentMonth,
      status: "pending",
      note: "Ramadan bonus",
      createdAt: today.format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 11,
      staffId: 8,
      staffName: "Dina Samy",
      staffRole: "Cleaner",
      type: "salary",
      amount: 3500,
      method: "cash",
      reference: "TXN-E5F6G7",
      month: lastMonth,
      status: "completed",
      note: "",
      createdAt: today.subtract(5, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(4, "day").format("YYYY-MM-DD"),
    },
    {
      id: 12,
      staffId: 10,
      staffName: "Rania Fawzy",
      staffRole: "Cashier",
      type: "deduction",
      amount: 150,
      method: "bank-transfer",
      reference: "TXN-H8I9J1",
      month: currentMonth,
      status: "processing",
      note: "Cash shortage deduction",
      createdAt: today.format("YYYY-MM-DD"),
      completedAt: null,
    },
    // Cash Advances
    {
      id: 13,
      staffId: 1,
      staffName: "Ahmed Hassan",
      staffRole: "Waiter",
      type: "advance",
      amount: 2000,
      method: "cash",
      reference: "TXN-ADV001",
      month: currentMonth,
      status: "completed",
      note: "Medical emergency - repay over 2 months",
      createdAt: today.subtract(10, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(9, "day").format("YYYY-MM-DD"),
    },
    {
      id: 14,
      staffId: 5,
      staffName: "Karim Saad",
      staffRole: "Delivery",
      type: "advance",
      amount: 3000,
      method: "bank-transfer",
      reference: "TXN-ADV002",
      month: currentMonth,
      status: "pending",
      note: "Wedding expenses - repay over 3 months",
      createdAt: today.subtract(2, "day").format("YYYY-MM-DD"),
      completedAt: null,
    },
    {
      id: 15,
      staffId: 7,
      staffName: "Youssef Khalil",
      staffRole: "Chef",
      type: "advance",
      amount: 1500,
      method: "cash",
      reference: "TXN-ADV003",
      month: lastMonth,
      status: "completed",
      note: "Personal needs - repaid via salary deduction",
      createdAt: today.subtract(20, "day").format("YYYY-MM-DD"),
      completedAt: today.subtract(18, "day").format("YYYY-MM-DD"),
    },
    {
      id: 16,
      staffId: 9,
      staffName: "Mostafa Adel",
      staffRole: "Waiter",
      type: "advance",
      amount: 1000,
      method: "cash",
      reference: "TXN-ADV004",
      month: currentMonth,
      status: "processing",
      note: "House rent help",
      createdAt: today.subtract(1, "day").format("YYYY-MM-DD"),
      completedAt: null,
    },
  ];
};

export default function useTransfers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transfers, setTransfers] = useState(generateMockTransfers);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStaffId, setFilterStaffId] = useState(null);

  useEffect(() => {
    const staffIdParam = searchParams.get("staffId");
    const typeParam = searchParams.get("type");

    if (staffIdParam) {
      const id = Number(staffIdParam);
      const staff = STAFF_MEMBERS.find((s) => s.id === id);
      if (staff) setFilterStaffId(id);
    }

    if (typeParam) {
      const validType = TRANSFER_TYPES.find((t) => t.value === typeParam);
      if (validType) setFilterType(typeParam);
    }
  }, [searchParams]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTransfer, setEditTransfer] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTransfer, setDeleteTransfer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredStaffMember = useMemo(() => {
    if (!filterStaffId) return null;
    return STAFF_MEMBERS.find((s) => s.id === filterStaffId) || null;
  }, [filterStaffId]);

  const filteredTransfers = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();

    return transfers.filter((transfer) => {
      const matchSearch =
        !searchLower ||
        transfer.staffName.toLowerCase().includes(searchLower) ||
        transfer.staffRole.toLowerCase().includes(searchLower) ||
        transfer.reference.toLowerCase().includes(searchLower) ||
        transfer.note.toLowerCase().includes(searchLower);

      const matchStatus = !filterStatus || transfer.status === filterStatus;
      const matchType = !filterType || transfer.type === filterType;
      const matchMethod = !filterMethod || transfer.method === filterMethod;
      const matchStaff = !filterStaffId || transfer.staffId === filterStaffId;

      return (
        matchSearch && matchStatus && matchType && matchMethod && matchStaff
      );
    });
  }, [
    transfers,
    deferredSearch,
    filterStatus,
    filterType,
    filterMethod,
    filterStaffId,
  ]);

  const stats = useMemo(() => {
    const sourceList = filterStaffId
      ? transfers.filter((t) => t.staffId === filterStaffId)
      : transfers;

    const total = sourceList.length;
    const pending = sourceList.filter((t) => t.status === "pending").length;
    const completed = sourceList.filter((t) => t.status === "completed").length;
    const failed = sourceList.filter((t) => t.status === "failed").length;

    const totalPaid = sourceList
      .filter(
        (t) =>
          t.status === "completed" &&
          (t.type === "salary" ||
            t.type === "bonus" ||
            t.type === "reimbursement")
      )
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDeductions = sourceList
      .filter((t) => t.type === "deduction")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalAdvances = sourceList
      .filter((t) => t.type === "advance")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      total,
      pending,
      completed,
      failed,
      totalPaid,
      totalDeductions,
      totalAdvances,
    };
  }, [transfers, filterStaffId]);

  const hasActiveFilters = !!(
    deferredSearch ||
    filterStatus ||
    filterType ||
    filterMethod ||
    filterStaffId
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus("");
    setFilterType("");
    setFilterMethod("");
    setFilterStaffId(null);
    setSearchParams({});
    toast("Filters cleared", { icon: "✓" });
  }, [setSearchParams]);

  const handleFilterByStaff = useCallback(
    (staffId) => {
      if (staffId) {
        setFilterStaffId(staffId);
        const params = { staffId: String(staffId) };
        if (filterType) params.type = filterType;
        setSearchParams(params);
      } else {
        setFilterStaffId(null);
        const params = {};
        if (filterType) params.type = filterType;
        setSearchParams(params);
      }
    },
    [setSearchParams, filterType]
  );

  const handleFilterByType = useCallback(
    (type) => {
      setFilterType(type);
      const params = {};
      if (filterStaffId) params.staffId = String(filterStaffId);
      if (type) params.type = type;
      setSearchParams(params);
    },
    [setSearchParams, filterStaffId]
  );

  const handleOpenAdd = useCallback(() => {
    setEditTransfer(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((transfer) => {
    setEditTransfer(transfer);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditTransfer(null);
  }, []);

  const handleSubmitTransfer = useCallback(
    async (values) => {
      setDrawerLoading(true);

      try {
        await new Promise((res) => setTimeout(res, 800));

        const staffMember = STAFF_MEMBERS.find((s) => s.id === values.staffId);

        if (editTransfer) {
          setTransfers((prev) =>
            prev.map((transfer) =>
              transfer.id === editTransfer.id
                ? {
                    ...transfer,
                    staffId: values.staffId,
                    staffName: staffMember?.name || transfer.staffName,
                    staffRole: staffMember?.role || transfer.staffRole,
                    type: values.type,
                    amount: values.amount,
                    method: values.method,
                    month: dayjs(values.month).format("YYYY-MM"),
                    note: values.note || "",
                  }
                : transfer
            )
          );
          toast.success("Transfer updated");
        } else {
          const newTransfer = {
            id: Date.now(),
            staffId: values.staffId,
            staffName: staffMember?.name || "",
            staffRole: staffMember?.role || "",
            type: values.type,
            amount: values.amount,
            method: values.method,
            reference: generateRef(),
            month: dayjs(values.month).format("YYYY-MM"),
            status: "pending",
            note: values.note || "",
            createdAt: dayjs().format("YYYY-MM-DD"),
            completedAt: null,
          };

          setTransfers((prev) => [newTransfer, ...prev]);
          toast.success(`Transfer created for ${staffMember?.name}`);
        }

        handleCloseDrawer();
      } catch {
        toast.error("Failed to save transfer");
      } finally {
        setDrawerLoading(false);
      }
    },
    [editTransfer, handleCloseDrawer]
  );

  const handleViewTransfer = useCallback((transfer) => {
    setViewTransfer(transfer);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewTransfer(null);
  }, []);

  const handleOpenDelete = useCallback((transfer) => {
    setDeleteTransfer(transfer);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteTransfer(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 700));
      const ref = deleteTransfer.reference;
      setTransfers((prev) => prev.filter((t) => t.id !== deleteTransfer.id));
      toast.success(`Transfer ${ref} has been removed`);
      handleCloseDelete();
    } catch {
      toast.error("Failed to delete transfer");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTransfer, handleCloseDelete]);

  const handleMarkCompleted = useCallback(async (transfer) => {
    try {
      await new Promise((res) => setTimeout(res, 500));

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transfer.id
            ? {
                ...t,
                status: "completed",
                completedAt: dayjs().format("YYYY-MM-DD"),
              }
            : t
        )
      );

      toast.success(`Transfer ${transfer.reference} marked as completed`);
    } catch {
      toast.error("Failed to update status");
    }
  }, []);

  const handleMarkProcessing = useCallback(async (transfer) => {
    try {
      await new Promise((res) => setTimeout(res, 500));

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transfer.id ? { ...t, status: "processing" } : t
        )
      );

      toast.success(`Transfer ${transfer.reference} is now processing`);
    } catch {
      toast.error("Failed to update status");
    }
  }, []);

  const handleRetry = useCallback(async (transfer) => {
    try {
      await new Promise((res) => setTimeout(res, 500));

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transfer.id ? { ...t, status: "pending" } : t
        )
      );

      toast.success(`Transfer ${transfer.reference} has been retried`);
    } catch {
      toast.error("Failed to retry transfer");
    }
  }, []);

  return {
    transfers: filteredTransfers,
    stats,
    transferTypes: TRANSFER_TYPES,
    paymentMethods: PAYMENT_METHODS,
    staffMembers: STAFF_MEMBERS,

    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterType,
    handleFilterByType,
    filterMethod,
    setFilterMethod,
    filterStaffId,
    filteredStaffMember,
    handleFilterByStaff,
    hasActiveFilters,
    handleClearFilters,

    drawerOpen,
    editTransfer,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitTransfer,

    viewModalOpen,
    viewTransfer,
    handleViewTransfer,
    handleCloseView,

    deleteModalOpen,
    deleteTransfer,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    handleMarkCompleted,
    handleMarkProcessing,
    handleRetry,
  };
}
